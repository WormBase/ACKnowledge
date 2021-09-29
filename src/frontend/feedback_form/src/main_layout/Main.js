import React, {useEffect} from 'react';
import queryString from 'query-string';
import {useDispatch} from "react-redux";
import MenuAndWidgets from "./MenuAndWidgets";
import {fetchPaperData, storePaperInfo} from "../redux/actions/paperActions";
import {fetchPersonData} from "../redux/actions/personActions";
import {withRouter} from "react-router-dom";

const Main = ({location}) => {

    const dispatch = useDispatch();
    const parameters = queryString.parse(location.search);

    useEffect(() => {
        dispatch(storePaperInfo(parameters.paper, parameters.passwd));
        dispatch(fetchPersonData(parameters.passwd, parameters.personid));
        dispatch(fetchPaperData(parameters.paper, parameters.passwd));
    }, [parameters]);

    return (
        <div>
            {process.env.NODE_ENV === "development" ?
                <div id="devBanner"><h3>Development Site</h3></div> : null}
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

export default withRouter(Main);
