import React from 'react';
import FlaggedDiffRow from "../../components/tabs_area/FlaggedDiffRow";
import {withRouter} from "react-router-dom";
import {fetchFlaggedData} from "../../redux/actions";
import {useQuery} from "react-query";
import {useSelector} from "react-redux";
import {Spinner} from "react-bootstrap";
import {classifierValue} from "../../lib/abcClassifiers";

const FLAGGED_DATATYPES = [
    {datatype: "otherexpr", title: "Anatomic expression data in WT condition"},
    {datatype: "seqchange", title: "Allele sequence change", manualOnly: true},
    {datatype: "geneint", title: "Genetic interactions"},
    {datatype: "geneprod", title: "Physical interactions"},
    {datatype: "genereg", title: "Regulatory interactions"},
    {datatype: "newmutant", title: "Allele phenotype"},
    {datatype: "rnai", title: "RNAi phenotype"},
    {datatype: "overexpr", title: "Transgene overexpression phenotype"},
    {datatype: "catalyticact", title: "Enzymatic activity"},
];

const FlaggedDataTypesTab = () => {
    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperFlagged' + paperID, () =>
        fetchFlaggedData(paperID));
    const data = queryRes.isSuccess ? queryRes.data.data : {};

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
                    {FLAGGED_DATATYPES.map(({datatype, title, manualOnly}) =>
                        <FlaggedDiffRow key={datatype} title={title}
                                        afpChecked={data["afp_" + datatype + "_checked"]}
                                        tfpChecked={classifierValue(data["svm_" + datatype + "_checked"], manualOnly)}
                                        afpDetails={data["afp_" + datatype + "_details"]}/>)}
                </div>
                : null}
        </div>
    );
}

export default withRouter(FlaggedDataTypesTab);
