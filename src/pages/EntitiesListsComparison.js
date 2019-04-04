import React from 'react';
import EntityDiffRow from "../page_components/EntityDiffRow";

class EntitiesListsComparison extends React.Component {

    render() {
        return(
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
                <EntityDiffRow title="Genes"/>
                <EntityDiffRow title="Species"/>
                <EntityDiffRow title="Alleles"/>
                <EntityDiffRow title="Transgenes"/>
                <EntityDiffRow title="Strains"/>
            </div>
        );
    }
}

export default EntitiesListsComparison;
