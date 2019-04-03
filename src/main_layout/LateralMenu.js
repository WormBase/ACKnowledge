import React from 'react';
import {IndexLinkContainer} from "react-router-bootstrap";

class LateralMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <h2>Author First Pass</h2>
                        <h3>Admin dashboard</h3><hr/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <IndexLinkContainer to="paper"
                                            active={true}>
                            <a><h4>Paper Viewer</h4></a>
                        </IndexLinkContainer>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <IndexLinkContainer to="stats"
                                            active={true}>
                            <a><h4>Statistics</h4></a>
                        </IndexLinkContainer>
                    </div>
                </div>
            </div>
        );
    }
}

export default LateralMenu;