import React from 'react';
import {withRouter} from "react-router-dom";
import queryString from 'query-string/index';
import {extractEntitiesFromTfpString} from "../../AFPValues";
import LoadingOverlay from 'react-loading-overlay';
import ManualEntityRow from "./tabs_area_components/ManualEntityRow";

class OtherDataTypesTab extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: queryString.parse(this.props.location.search).paper_id,
            afpNewAlleles: [],
            afpNewStrains: [],
            afpNewTransgenes: [],
            afpOtherAntibodies: [],
            isLoading: false
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    componentDidUpdate() {
        if (this.state.paper_id !== queryString.parse(this.props.location.search).paper_id) {
            this.loadDataFromAPI();
            this.setState({paper_id: queryString.parse(this.props.location.search).paper_id});
        }

    }

    componentDidMount() {
        this.loadDataFromAPI();
    }

    loadDataFromAPI() {
        let payload = {
            paper_id: queryString.parse(this.props.location.search).paper_id
        };
        if (payload.paper_id !== undefined) {
            this.setState({isLoading: true});
            fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/others", {
                method: 'POST',
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {

                }
            }).then(data => {
                if (data === undefined) {

                }
                let afp_newalleles = data["afp_newalleles"];
                if (afp_newalleles !== '') {
                    afp_newalleles = data["afp_newalleles"].split(" | ");
                } else {
                    afp_newalleles = [];
                }
                let afp_newstrains = data["afp_newstrains"];
                if (afp_newstrains !== '') {
                    afp_newstrains = data["afp_newstrains"].split(" | ");
                } else {
                    afp_newstrains = [];
                }
                let afp_newtransgenes = data["afp_newtransgenes"];
                if (afp_newtransgenes !== '') {
                    afp_newtransgenes = data["afp_newtransgenes"].split(" | ");
                } else {
                    afp_newtransgenes = [];
                }
                let afp_otherantibodies = data["afp_otherantibodies"];
                if (afp_otherantibodies !== '') {
                    afp_otherantibodies = extractEntitiesFromTfpString(data["afp_otherantibodies"], "");
                } else {
                    afp_otherantibodies = [];
                }
                this.setState({
                    afpNewAlleles: afp_newalleles,
                    afpNewStrains: afp_newstrains,
                    afpNewTransgenes: afp_newtransgenes,
                    afpOtherAntibodies: afp_otherantibodies,
                    isLoading: false
                })
            }).catch((err) => {
                alert(err);
            });
        }
    }

    render() {
        return(
            <LoadingOverlay
                active={this.state.isLoading}
                spinner
                text='Loading paper data...'
                styles={{
                    overlay: (base) => ({
                        ...base,
                        background: 'rgba(65,105,225,0.5)'
                    })
                }}
            >
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <h5>Entities Added by author</h5>
                        </div>
                    </div>
                    <ManualEntityRow title="New Alleles" afpEntityList={this.state.afpNewAlleles}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <ManualEntityRow title="New Strains" afpEntityList={this.state.afpNewStrains}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <ManualEntityRow title="New Transgenes" afpEntityList={this.state.afpNewTransgenes}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <ManualEntityRow title="Other Antibodies" afpEntityList={this.state.afpOtherAntibodies}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                </div>
            </LoadingOverlay>
        );
    }
}

export default withRouter(OtherDataTypesTab);
