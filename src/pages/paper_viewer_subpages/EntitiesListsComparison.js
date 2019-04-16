import React from 'react';
import EntityDiffRow from "../../page_components/EntityDiffRow";
import {withRouter} from "react-router-dom";
import queryString from 'query-string/index';
import {extractEntitiesFromTfpString} from "../../AFPValues";
import LoadingOverlay from 'react-loading-overlay';

class EntitiesListsComparison extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: queryString.parse(this.props.location.search).paper_id,
            tfpGenestudied: [],
            afpGenestudied: [],
            tfpSpecies: [],
            afpSpecies: [],
            tfpAlleles: [],
            afpAlleles: [],
            tfpStrains: [],
            afpStrains: [],
            tfpTransgenes: [],
            afpTransgenes: [],
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
            fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/lists", {
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
                let tfp_genestudied = data["tfp_genestudied"];
                if (tfp_genestudied !== '') {
                    tfp_genestudied = extractEntitiesFromTfpString(data["tfp_genestudied"], "WBGene");
                } else {
                    tfp_genestudied = [];
                }
                let afp_genestudied = data["afp_genestudied"];
                if (afp_genestudied !== '') {
                    afp_genestudied = extractEntitiesFromTfpString(data["afp_genestudied"], "WBGene");
                } else {
                    afp_genestudied = [];
                }
                let tfp_species = data["tfp_species"];
                if (tfp_species !== '') {
                    tfp_species = data["tfp_species"].split("|");
                } else {
                    tfp_species = [];
                }
                let afp_species = data["afp_species"];
                if (afp_species !== '') {
                    afp_species = data["afp_species"].split("|");
                } else {
                    afp_species = [];
                }
                let tfp_alleles = data["tfp_alleles"];
                if (tfp_alleles !== '') {
                    tfp_alleles = extractEntitiesFromTfpString(data["tfp_alleles"], "");
                } else {
                    tfp_alleles = [];
                }
                let afp_alleles = data["afp_alleles"];
                if (afp_alleles !== '') {
                    afp_alleles = extractEntitiesFromTfpString(data["afp_alleles"], "WBVar");
                } else {
                    afp_alleles = [];
                }
                let tfp_strains = data["tfp_strains"];
                if (tfp_strains !== '') {
                    tfp_strains = data["tfp_strains"].split("|");
                } else {
                    tfp_strains = [];
                }
                let afp_strains = data["afp_strains"];
                if (afp_strains !== '') {
                    afp_strains = data["afp_strains"].split("|");
                } else {
                    afp_strains = [];
                }
                let tfp_transgenes = data["tfp_transgenes"];
                if (tfp_transgenes !== '') {
                    tfp_transgenes = extractEntitiesFromTfpString(data["tfp_transgenes"], "");
                } else {
                    tfp_transgenes = [];
                }
                let afp_transgenes = data["afp_transgenes"];
                if (afp_transgenes !== '') {
                    afp_transgenes = extractEntitiesFromTfpString(data["afp_transgenes"], "WBTransgene");
                } else {
                    afp_transgenes = [];
                }
                this.setState({
                    tfpGenestudied: tfp_genestudied,
                    afpGenestudied: afp_genestudied,
                    tfpSpecies: tfp_species,
                    afpSpecies: afp_species,
                    tfpAlleles: tfp_alleles,
                    afpAlleles: afp_alleles,
                    tfpStrains: tfp_strains,
                    afpStrains: afp_strains,
                    tfpTransgenes: tfp_transgenes,
                    afpTransgenes: afp_transgenes,
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
                        <div className="col-sm-3">
                            <h4>Extracted by AFP</h4>
                        </div>
                        <div className="col-sm-3">
                            <h4>Final list submitted by author</h4>
                        </div>
                        <div className="col-sm-3">
                            <h4>Added by author w.r.t. AFP</h4>
                        </div>
                        <div className="col-sm-3">
                            <h4>Removed by author w.r.t. AFP</h4>
                        </div>
                    </div>
                    <EntityDiffRow title="Genes" tfpEntitiesList={this.state.tfpGenestudied}
                                   afpEntitiesList={this.state.afpGenestudied}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Species" tfpEntitiesList={this.state.tfpSpecies}
                                   afpEntitiesList={this.state.afpSpecies}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Alleles" tfpEntitiesList={this.state.tfpAlleles}
                                   afpEntitiesList={this.state.afpAlleles}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Strains" tfpEntitiesList={this.state.tfpStrains}
                                   afpEntitiesList={this.state.afpStrains}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Transgenes" tfpEntitiesList={this.state.tfpTransgenes}
                                   afpEntitiesList={this.state.afpTransgenes}/>

                </div>
            </LoadingOverlay>
        );
    }
}

export default withRouter(EntitiesListsComparison);
