import React from 'react';
import FlaggedInfoRow from "../../components/tabs_area/FlaggedInfoRow";
import {useSelector} from "react-redux";
import {useQuery} from "react-query";
import {fetchAuthorFlagged} from "../../redux/actions";
import {Spinner} from "react-bootstrap";

const OtherYesNoDataTypesTab = () => {
    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperAuthorFlagged' + paperID, () =>
        fetchAuthorFlagged(paperID));
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
                    <FlaggedInfoRow title="Gene model correction/update" afpChecked={queryRes.data.data.afp_modchange_checked}
                                    afpDetails={queryRes.data.data.afp_modchange_details}
                    />
                    <FlaggedInfoRow title="Newly generated antibody" afpChecked={queryRes.data.data.afp_newantibody_checked}
                                    afpDetails={queryRes.data.data.afp_newantibody_details}
                    />
                    <FlaggedInfoRow title="Site of action data" afpChecked={queryRes.data.data.afp_siteaction_checked}
                                    afpDetails={queryRes.data.data.afp_siteaction_details}
                    />
                    <FlaggedInfoRow title="Time of action data" afpChecked={queryRes.data.data.afp_timeaction_checked}
                                    afpDetails={queryRes.data.data.afp_timeaction_details}
                    />
                    <FlaggedInfoRow title="RNAseq data" afpChecked={queryRes.data.data.afp_rnaseq_checked}
                                    afpDetails={queryRes.data.data.afp_rnaseq_details}
                    />
                    <FlaggedInfoRow title="Chemically induced phenotype" afpChecked={queryRes.data.data.afp_chemphen_checked}
                                    afpDetails={queryRes.data.data.afp_chemphen_details}
                    />
                    <FlaggedInfoRow title="Environmental induced phenotype" afpChecked={queryRes.data.data.afp_envpheno_checked}
                                    afpDetails={queryRes.data.data.afp_envpheno_details}
                    />
                    <FlaggedInfoRow title="Human disease model" afpChecked={queryRes.data.data.afp_humdis_checked}
                                    afpDetails={queryRes.data.data.afp_humdis_details}
                    />
                    <FlaggedInfoRow title="Additional type of expression data"
                                    afpChecked={queryRes.data.data.afp_additionalexpr === null ? "null" : queryRes.data.data.afp_additionalexpr !== ""? "True" : "False"}
                                    afpDetails={queryRes.data.data.afp_additionalexpr === null ? "null" : queryRes.data.data.afp_additionalexpr}
                    />
                    <FlaggedInfoRow title="Other gene function"
                                    afpChecked={queryRes.data.data.afp_othergenefunc_checked}
                                    afpDetails={queryRes.data.data.afp_othergenefunc_details}
                    />
                </div>
                : null}
        </div>
    );
}

export default OtherYesNoDataTypesTab;
