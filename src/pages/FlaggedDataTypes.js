import React from 'react';
import EntityDiffRow from "../page_components/EntityDiffRow";

class FlaggedDataTypes extends React.Component {

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
                        <h4>Data type</h4>
                    </div>
                    <div className="col-sm-3">
                        <h4>Extracted by AFP</h4>
                    </div>
                    <div className="col-sm-3">
                        <h4>Submitted/confirmed by author</h4>
                    </div>
                    <div className="col-sm-3">
                        <h4>Author changed?</h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <hr/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Data type 1
                    </div>
                    <div className="col-sm-3">
                        Checked: yes
                    </div>
                    <div className="col-sm-3">
                        Checked: no<br/>
                        Details: None
                    </div>
                    <div className="col-sm-3">
                        Changed
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <hr/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Data type 1
                    </div>
                    <div className="col-sm-3">
                        Checked: yes
                    </div>
                    <div className="col-sm-3">
                        Checked: no<br/>
                        Details: None
                    </div>
                    <div className="col-sm-3">
                        Changed
                    </div>
                </div>
            </div>
        );
    }
}

export default FlaggedDataTypes;
