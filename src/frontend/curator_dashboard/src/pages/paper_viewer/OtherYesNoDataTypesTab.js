import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import FlaggedDiffRow from "./tabs_area_components/FlaggedDiffRow";
import {withRouter} from "react-router-dom";
import queryString from "query-string/index";
import FlaggedInfoRow from "./tabs_area_components/FlaggedInfoRow";

class OtherYesNoDataTypesTab extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: queryString.parse(this.props.location.search).paper_id,
            afp_modchange_checked: "",
            afp_modchange_details: "",
            afp_newantibody_checked: "",
            afp_newantibody_details: "",
            afp_siteaction_checked: "",
            afp_siteaction_details: "",
            afp_timeaction_checked: "",
            afp_timeaction_details: "",
            afp_rnaseq_checked: "",
            afp_rnaseq_details: "",
            afp_chemphen_checked: "",
            afp_chemphen_details: "",
            afp_envpheno_checked: "",
            afp_envpheno_details: "",
            afp_humdis_checked: "",
            afp_humdis_details: "",
            afp_additionalexpr: "",
            afp_othergenefunc_checked: "",
            afp_othergenefunc_details: "",
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
            fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/other_yn", {
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
                this.setState({
                    afp_modchange_checked: data["afp_modchange_checked"],
                    afp_modchange_details: data["afp_modchange_details"],
                    afp_newantibody_checked: data["afp_newantibody_checked"],
                    afp_newantibody_details: data["afp_newantibody_details"],
                    afp_siteaction_checked: data["afp_siteaction_checked"],
                    afp_siteaction_details: data["afp_siteaction_details"],
                    afp_timeaction_checked: data["afp_timeaction_checked"],
                    afp_timeaction_details: data["afp_timeaction_details"],
                    afp_rnaseq_checked: data["afp_rnaseq_checked"],
                    afp_rnaseq_details: data["afp_rnaseq_details"],
                    afp_chemphen_checked: data["afp_chemphen_checked"],
                    afp_chemphen_details: data["afp_chemphen_details"],
                    afp_envpheno_checked: data["afp_envpheno_checked"],
                    afp_envpheno_details: data["afp_envpheno_details"],
                    afp_humdis_checked: data["afp_humdis_checked"],
                    afp_humdis_details: data["afp_humdis_details"],
                    afp_additionalexpr: data["afp_additionalexpr"],
                    afp_othergenefunc_checked: data["afp_othergenefunc_checked"],
                    afp_othergenefunc_details: data["afp_othergenefunc_details"],
                    isLoading: false
                });
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
                        <div className="col-sm-6">
                            <h5>Data type</h5>
                        </div>
                        <div className="col-sm-6">
                            <h5>Submitted by author</h5>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <FlaggedInfoRow title="Gene model correction/update" afpChecked={this.state.afp_modchange_checked}
                                    afpDetails={this.state.afp_modchange_details}
                    />
                    <FlaggedInfoRow title="Newly generated antibody" afpChecked={this.state.afp_newantibody_checked}
                                    afpDetails={this.state.afp_newantibody_details}
                    />
                    <FlaggedInfoRow title="Site of action data" afpChecked={this.state.afp_siteaction_checked}
                                    afpDetails={this.state.afp_siteaction_details}
                    />
                    <FlaggedInfoRow title="Time of action data" afpChecked={this.state.afp_timeaction_checked}
                                    afpDetails={this.state.afp_timeaction_details}
                    />
                    <FlaggedInfoRow title="RNAseq data" afpChecked={this.state.afp_rnaseq_checked}
                                    afpDetails={this.state.afp_rnaseq_details}
                    />
                    <FlaggedInfoRow title="Chemically induced phenotype" afpChecked={this.state.afp_chemphen_checked}
                                    afpDetails={this.state.afp_chemphen_details}
                    />
                    <FlaggedInfoRow title="Environmental induced phenotype" afpChecked={this.state.afp_envpheno_checked}
                                    afpDetails={this.state.afp_envpheno_details}
                    />
                    <FlaggedInfoRow title="Human disease model" afpChecked={this.state.afp_humdis_checked}
                                    afpDetails={this.state.afp_humdis_details}
                    />
                    <FlaggedInfoRow title="Additional type of expression data"
                                    afpChecked={this.state.afp_additionalexpr === null ? "null" : this.state.afp_additionalexpr !== ""? "True" : "False"}
                                    afpDetails={this.state.afp_additionalexpr === null ? "null" : this.state.afp_additionalexpr}
                    />
                    <FlaggedInfoRow title="Other gene function"
                                    afpChecked={this.state.afp_othergenefunc_checked}
                                    afpDetails={this.state.afp_othergenefunc_details}
                    />
                </div>
            </LoadingOverlay>
        );
    }
}

export default withRouter(OtherYesNoDataTypesTab);
