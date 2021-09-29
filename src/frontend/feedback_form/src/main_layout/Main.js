import React, {useEffect} from 'react';
import queryString from 'query-string';
import {useDispatch, useSelector} from "react-redux";
import MenuAndWidgets from "./MenuAndWidgets";
import {fetchPaperData, storePaperInfo} from "../redux/actions/paperActions";
import {fetchPersonData} from "../redux/actions/personActions";
import {withRouter} from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';

const Main = ({location}) => {

    const dispatch = useDispatch();
    const parameters = queryString.parse(location.search);
    const personIsLoading = useSelector((state) => state.person.person.isLoading);
    const paperIsLoading = useSelector((state) => state.paper.paperData.isLoading);

    useEffect(() => {
        dispatch(storePaperInfo(parameters.paper, parameters.passwd));
        dispatch(fetchPersonData(parameters.passwd, parameters.personid));
        dispatch(fetchPaperData(parameters.paper, parameters.passwd));
    }, []);

    return (
        <div>
            {process.env.NODE_ENV === "development" ?
                <div id="devBanner"><h3>Development Site</h3></div> : null}
            <LoadingOverlay
                            active={personIsLoading || paperIsLoading}
                            spinner
                            text='Loading data ...'
            >
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">

                            <MenuAndWidgets/>
                        </div>
                    </div>
                </div>
            </LoadingOverlay>
        </div>
    );
}

export default withRouter(Main);
