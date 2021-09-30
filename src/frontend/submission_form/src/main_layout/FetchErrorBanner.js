import React from "react";
import {useSelector} from "react-redux";
import Alert from "react-bootstrap/lib/Alert";
import Glyphicon from "react-bootstrap/lib/Glyphicon";

const FetchErrorBanner = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12">
                    {useSelector((state) => state.display.showDataFetchError) ?
                        <Alert bsStyle="danger">
                            <Glyphicon glyph="warning-sign"/>
                            <strong>Error</strong><br/>
                            We are having problems retrieving your data from the server and some components may
                            behave incorrectly. This could be caused by wrong credentials or by a network issue.
                            Please try again later or contact <a href="mailto:help@wormbase.org">
                            Wormbase Helpdesk</a>.
                        </Alert> : null
                    }
                </div>
            </div>
        </div>
    )
}

export default FetchErrorBanner;