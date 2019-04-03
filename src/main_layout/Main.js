import React from 'react';
import {withRouter} from "react-router-dom";
import LateralMenu from "./LateralMenu";
import PageArea from "./PageArea";

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-2" id="lateralMenu">
                        <LateralMenu/>
                    </div>
                    <div className="col-sm-10">
                        <PageArea/>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Main);