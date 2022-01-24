import React from 'react';
import EntityDiffRow from "../../components/tabs_area/EntityDiffRow";
import {useSelector} from "react-redux";
import {useQuery} from "react-query";
import {fetchEntityLists} from "../../redux/actions";
import {Spinner} from "react-bootstrap";

const EntitiesListsComparisonTab = () => {

    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperEntities' + paperID, () =>
        fetchEntityLists(paperID));

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
                            <h5>Extracted by AFP</h5>
                        </div>
                        <div className="col-sm-3">
                            <h5>Final list submitted by author</h5>
                        </div>
                        <div className="col-sm-3">
                            <h5>Added by author w.r.t. AFP</h5>
                        </div>
                        <div className="col-sm-3">
                            <h5>Removed by author w.r.t. AFP</h5>
                        </div>
                    </div>
                    <EntityDiffRow title="Genes" tfpEntitiesList={queryRes.data.tfp_genestudied}
                                   afpEntitiesList={queryRes.data.afp_genestudied}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Species" tfpEntitiesList={queryRes.data.tfp_species}
                                   afpEntitiesList={queryRes.data.afp_species}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Alleles" tfpEntitiesList={queryRes.data.tfp_alleles}
                                   afpEntitiesList={queryRes.data.afp_alleles}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Strains" tfpEntitiesList={queryRes.data.tfp_strains}
                                   afpEntitiesList={queryRes.data.afp_strains}/>
                    <div className="row">
                        <div className="col-sm-12">
                            <hr/>
                        </div>
                    </div>
                    <EntityDiffRow title="Transgenes" tfpEntitiesList={queryRes.data.tfp_transgenes}
                                   afpEntitiesList={queryRes.data.afp_transgenes}/>

                </div>
                : null}
        </div>
    );
}

export default EntitiesListsComparisonTab;
