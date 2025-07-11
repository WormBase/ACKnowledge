import React, {useEffect} from 'react';
import queryString from 'query-string';
import {useDispatch, useSelector} from "react-redux";
import MenuAndWidgets from "./MenuAndWidgets";
import {fetchPaperData, storePaperInfo} from "../redux/actions/paperActions";
import {fetchPersonData} from "../redux/actions/personActions";
import {withRouter} from "react-router-dom";
import LoadingOverlay from 'react-loading-overlay';
import FetchErrorBanner from "./FetchErrorBanner";
import Header from "./Header";
import Title from "./Title";
import DevBanner from "./DevBanner";

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
            <DevBanner />
            <LoadingOverlay active={personIsLoading || paperIsLoading} spinner text='Loading data ...'>
                <FetchErrorBanner />
                <Header />
                <Title title={parameters.title !== undefined ? "\"" + parameters.title + "\"" : ""}
                       journal={parameters.journal} pmid={parameters.pmid} doi={parameters.doi} />
                <MenuAndWidgets />
            </LoadingOverlay>
        </div>
    );
}

export default withRouter(Main);
