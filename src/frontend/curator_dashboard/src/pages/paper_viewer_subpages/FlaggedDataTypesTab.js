import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import FlaggedDiffRow from "../../page_components/FlaggedDiffRow";
import {withRouter} from "react-router-dom";
import queryString from "query-string/index";

class FlaggedDataTypesTab extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: queryString.parse(this.props.location.search).paper_id,
            svm_seqchange_checked: "no",
            afp_seqchange_checked: "no",
            afp_seqchange_details: "",
            svm_geneint_checked: "no",
            afp_geneint_checked: "no",
            afp_geneint_details: "",
            svm_geneprod_checked: "no",
            afp_geneprod_checked: "no",
            afp_geneprod_details: "",
            svm_genereg_checked: "no",
            afp_genereg_checked: "no",
            afp_genereg_details: "",
            svm_newmutant_checked: "no",
            afp_newmutant_checked: "no",
            afp_newmutant_details: "",
            svm_rnai_checked: "no",
            afp_rnai_checked: "no",
            afp_rnai_details: "",
            svm_overexpr_checked: "no",
            afp_overexpr_checked: "no",
            afp_overexpr_details: "",
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
            fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/flagged", {
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
                    svm_otherexpr_checked: data["svm_otherexpr_checked"],
                    afp_otherexpr_checked: data["afp_otherexpr_checked"],
                    afp_otherexpr_details: data["afp_otherexpr_details"],
                    svm_seqchange_checked: data["svm_seqchange_checked"],
                    afp_seqchange_checked: data["afp_seqchange_checked"],
                    afp_seqchange_details: data["afp_seqchange_details"],
                    svm_geneint_checked: data["svm_geneint_checked"],
                    afp_geneint_checked: data["afp_geneint_checked"],
                    afp_geneint_details: data["afp_geneint_details"],
                    svm_geneprod_checked: data["svm_geneprod_checked"],
                    afp_geneprod_checked: data["afp_geneprod_checked"],
                    afp_geneprod_details: data["afp_geneprod_details"],
                    svm_genereg_checked: data["svm_genereg_checked"],
                    afp_genereg_checked: data["afp_genereg_checked"],
                    afp_genereg_details: data["afp_genereg_details"],
                    svm_newmutant_checked: data["svm_newmutant_checked"],
                    afp_newmutant_checked: data["afp_newmutant_checked"],
                    afp_newmutant_details: data["afp_newmutant_details"],
                    svm_rnai_checked: data["svm_rnai_checked"],
                    afp_rnai_checked: data["afp_rnai_checked"],
                    afp_rnai_details: data["afp_rnai_details"],
                    svm_overexpr_checked: data["svm_overexpr_checked"],
                    afp_overexpr_checked: data["afp_overexpr_checked"],
                    afp_overexpr_details: data["afp_overexpr_details"],
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
                            <h5>Data type</h5>
                        </div>
                        <div className="col-sm-3">
                            <h5>Extracted by AFP</h5>
                        </div>
                        <div className="col-sm-3">
                            <h5>Submitted/confirmed by author</h5>
                        </div>
                        <div className="col-sm-3">
                            <h5>Author changed?</h5>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <FlaggedDiffRow title="Anatomic expression data in WT condition" afpChecked={this.state.afp_otherexpr_checked}
                                    tfpChecked={this.state.svm_otherexpr_checked} afpDetails={this.state.afp_otherexpr_details}/>
                    <FlaggedDiffRow title="Allele sequence change" afpChecked={this.state.afp_seqchange_checked}
                                    tfpChecked={this.state.svm_seqchange_checked} afpDetails={this.state.afp_seqchange_details}/>
                    <FlaggedDiffRow title="Genetic interactions" afpChecked={this.state.afp_geneint_checked}
                                    tfpChecked={this.state.svm_geneint_checked} afpDetails={this.state.afp_geneint_details}/>
                    <FlaggedDiffRow title="Physical interactions" afpChecked={this.state.afp_geneprod_checked}
                                    tfpChecked={this.state.svm_geneprod_checked} afpDetails={this.state.afp_geneprod_details}/>
                    <FlaggedDiffRow title="Regulatory interactions" afpChecked={this.state.afp_genereg_checked}
                                    tfpChecked={this.state.svm_genereg_checked} afpDetails={this.state.afp_genereg_details}/>
                    <FlaggedDiffRow title="Allele phenotype" afpChecked={this.state.afp_newmutant_checked}
                                    tfpChecked={this.state.svm_newmutant_checked} afpDetails={this.state.afp_newmutant_details}/>
                    <FlaggedDiffRow title="RNAi phenotype" afpChecked={this.state.afp_rnai_checked}
                                    tfpChecked={this.state.svm_rnai_checked} afpDetails={this.state.afp_rnai_details}/>
                    <FlaggedDiffRow title="Transgene overexpression phenotype" afpChecked={this.state.afp_overexpr_checked}
                                    tfpChecked={this.state.svm_overexpr_checked} afpDetails={this.state.afp_overexpr_details}/>
                </div>
            </LoadingOverlay>
        );
    }
}

export default withRouter(FlaggedDataTypesTab);
