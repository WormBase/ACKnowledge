import React from 'react';
import {IndexLinkContainer} from "react-router-bootstrap";
import {withRouter} from "react-router-dom";

class LateralMenu extends React.Component {
    render() {
        let url = document.location.toString();
        let args = "";
        if (url.match('\\?')) {
            args = "?" + url.split('?')[1]
        }

        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Author First Pass</h3>
                        <h4>Admin dashboard</h4><hr/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <IndexLinkContainer to={"paper" + args}
                                            active={true}>
                            <a className="aw"><h4>Paper Status</h4></a>
                        </IndexLinkContainer>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <IndexLinkContainer to={"stats" + args}
                                            active={true}>
                            <a className="aw"><h4>Overall Stats</h4></a>
                        </IndexLinkContainer>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <IndexLinkContainer to={"lists" + args}
                                            active={true}>
                            <a className="aw"><h4>Paper Lists</h4></a>
                        </IndexLinkContainer>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(LateralMenu);