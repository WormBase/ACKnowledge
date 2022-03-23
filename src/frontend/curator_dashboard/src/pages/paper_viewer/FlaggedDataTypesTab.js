import React from 'react';
import FlaggedDiffRow from "../../components/tabs_area/FlaggedDiffRow";
import {withRouter} from "react-router-dom";
import {fetchFlaggedData} from "../../redux/actions";
import {useQuery} from "react-query";
import {useSelector} from "react-redux";
import {Spinner} from "react-bootstrap";

const FlaggedDataTypesTab = () => {
    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperFlagged' + paperID, () =>
        fetchFlaggedData(paperID));

    return(
        <div>
            {queryRes.isLoading ? <Spinner animation="border"/> : null}
            {queryRes.isSuccess ?
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
                            <h5>Extracted by ACKnowledge</h5>
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
                    <FlaggedDiffRow title="Anatomic expression data in WT condition" afpChecked={queryRes.data.data.afp_otherexpr_checked}
                                    tfpChecked={queryRes.data.data.svm_otherexpr_checked} afpDetails={queryRes.data.data.afp_otherexpr_details}/>
                    <FlaggedDiffRow title="Allele sequence change" afpChecked={queryRes.data.data.afp_seqchange_checked}
                                    tfpChecked={queryRes.data.data.svm_seqchange_checked} afpDetails={queryRes.data.data.afp_seqchange_details}/>
                    <FlaggedDiffRow title="Genetic interactions" afpChecked={queryRes.data.data.afp_geneint_checked}
                                    tfpChecked={queryRes.data.data.svm_geneint_checked} afpDetails={queryRes.data.data.afp_geneint_details}/>
                    <FlaggedDiffRow title="Physical interactions" afpChecked={queryRes.data.data.afp_geneprod_checked}
                                    tfpChecked={queryRes.data.data.svm_geneprod_checked} afpDetails={queryRes.data.data.afp_geneprod_details}/>
                    <FlaggedDiffRow title="Regulatory interactions" afpChecked={queryRes.data.data.afp_genereg_checked}
                                    tfpChecked={queryRes.data.data.svm_genereg_checked} afpDetails={queryRes.data.data.afp_genereg_details}/>
                    <FlaggedDiffRow title="Allele phenotype" afpChecked={queryRes.data.data.afp_newmutant_checked}
                                    tfpChecked={queryRes.data.data.svm_newmutant_checked} afpDetails={queryRes.data.data.afp_newmutant_details}/>
                    <FlaggedDiffRow title="RNAi phenotype" afpChecked={queryRes.data.data.afp_rnai_checked}
                                    tfpChecked={queryRes.data.data.svm_rnai_checked} afpDetails={queryRes.data.data.afp_rnai_details}/>
                    <FlaggedDiffRow title="Transgene overexpression phenotype" afpChecked={queryRes.data.data.afp_overexpr_checked}
                                    tfpChecked={queryRes.data.data.svm_overexpr_checked} afpDetails={queryRes.data.data.afp_overexpr_details}/>
                    <FlaggedDiffRow title="Enzymatic activity" afpChecked={queryRes.data.data.afp_catalyticact_checked}
                                    tfpChecked={queryRes.data.data.svm_catalyticact_checked} afpDetails={queryRes.data.data.afp_catalyticact_details}/>
                </div>
                : null}
        </div>
    );
}

export default withRouter(FlaggedDataTypesTab);
