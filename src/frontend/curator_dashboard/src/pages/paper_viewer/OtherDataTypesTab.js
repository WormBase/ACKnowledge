import React from 'react';
import ManualEntityRow from "./tabs_area_components/ManualEntityRow";
import {useSelector} from "react-redux";
import {useQuery} from "react-query";
import {fetchOtherData} from "../../redux/actions";
import {Spinner} from "react-bootstrap";

const OtherDataTypesTab = () => {
    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperOtherData' + paperID, () =>
        fetchOtherData(paperID));
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
                        <div className="col-sm-12">
                            <h5>Entities Added by author</h5>
                        </div>
                    </div>
                    <ManualEntityRow title="New Alleles" afpEntityList={queryRes.data.afp_newalleles}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <ManualEntityRow title="New Strains" afpEntityList={queryRes.data.afp_newstrains}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <ManualEntityRow title="New Transgenes" afpEntityList={queryRes.data.afp_newtransgenes}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <ManualEntityRow title="Other Antibodies" afpEntityList={queryRes.data.afp_otherantibodies}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                </div>
                : null}
        </div>
    );
}

export default OtherDataTypesTab;
