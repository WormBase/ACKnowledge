import React, {useEffect} from 'react';
import queryString from 'query-string';
import {connect} from "react-redux";
import MenuAndWidgets from "./MenuAndWidgets";
import withRouter from "react-router/withRouter";
import {fetchPaperData, storePaperInfo} from "../redux/actions/paperActions";
import {getPaperFetchError, getPaperFetchIsLoading} from "../redux/selectors/paperSelectors";
import {getPersonFetchError, getPersonFetchIsLoading} from "../redux/selectors/personSelectors";
import {fetchPersonData} from "../redux/actions/personActions";
import {showDataFetchError} from "../redux/actions/displayActions";

const Main = (props) => {

    useEffect(() => {
        let parameters = queryString.parse(props.location.search);
        props.storePaperInfo(parameters.paper, parameters.passwd);
        props.fetchPersonData(parameters.passwd, parameters.personid);
        props.fetchPaperData(parameters.paper, parameters.passwd);
    }, []);

    useEffect(() => {
        if (props.personFetchError || props.paperFetchError) {
            props.showDataFetchError()
        }
    }, [props.paperFetchError, props.personFetchError]);

    let developmentBanner = "";
    if (process.env.NODE_ENV === "development") {
        developmentBanner = <div id="devBanner"><h3>Development Site</h3></div>;
    }
    return (
        <div>
            {developmentBanner}
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <MenuAndWidgets/>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    paperFetchError: getPaperFetchError(state),
    personFetchError: getPersonFetchError(state),
    paperIsLoading: getPaperFetchIsLoading(state),
    personIsLoading: getPersonFetchIsLoading(state),
});

export default connect(mapStateToProps, {fetchPaperData, fetchPersonData, storePaperInfo, showDataFetchError})(withRouter(Main));
