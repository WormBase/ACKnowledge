import React, {useState} from 'react';
import {withRouter} from "react-router-dom";
import {Alert} from "react-bootstrap";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import Title from "./Title";
import Header from "./Header";
import {SectionsNotCompletedModal, WelcomeModal} from "../components/modals/MainModals";
import DataSavedModal from "../components/modals/DataSavedModal";
import PersonSelector from "../components/PersonSelector";
import {MENU_INDEX, WIDGET, WIDGET_TITLE} from "../constants";
import {useDispatch, useSelector} from "react-redux";
import {hideDataSaved, hideSectionsNotCompleted} from "../redux/actions/displayActions";
import Menu from "./Menu";
import {setSelectedWidget} from "../redux/actions/widgetActions";
import WidgetArea from "./WidgetArea";
import queryString from "query-string";

const MenuAndWidgets = (props) => {
    const dispatch = useDispatch();
    const currentLocation = props.location.pathname;
    if (currentLocation !== "" && currentLocation !== "/") {
        dispatch(setSelectedWidget(MENU_INDEX[currentLocation.substring(1)]));
    }
    const [showPopup, setShowPopup] = useState(true);

    let parameters = queryString.parse(props.location.search);
    const pages = [WIDGET.OVERVIEW, WIDGET.GENETICS, WIDGET.REAGENT, WIDGET.EXPRESSION,
        WIDGET.INTERACTIONS, WIDGET.PHENOTYPES, WIDGET.DISEASE, WIDGET.COMMENTS];

    const selectedWidget = useSelector((state) => state.widget.selectedWidget);

    const goToNextSection = () => {
        const newSelectedMenu = Math.min(selectedWidget + 1, pages.length);
        dispatch(setSelectedWidget(newSelectedMenu));
        dispatch(hideDataSaved());
        props.history.push(pages[newSelectedMenu - 1] + props.location.search);
        window.scrollTo(0, 0)
    }

    const handleClosePopup = () => {
        setShowPopup(false);
    }

    return (
        <div className="container">
            <div className="row">
                {useSelector((state) => state.display.showDataFetchError) ?
                    <Alert bsStyle="danger">
                        <Glyphicon glyph="warning-sign"/>
                        <strong>Error</strong><br/>
                        We are having problems retrieving your data from the server and some components may
                        behave incorrectly. This could be caused by wrong credentials or by a network issue.
                        Please try again later or contact <a href="mailto:help@wormbase.org">
                        Wormbase Helpdesk</a>.
                    </Alert> : null}
                <div id="whiteBanner"/>
                <Header {...props}/>
                <Title title={parameters.title !== undefined ? "\"" + parameters.title + "\"" : ""}
                       journal={parameters.journal} pmid={parameters.pmid} doi={parameters.doi}/><br/>
                <div>
                    <div>
                        <div className="col-sm-4">
                            <Menu urlQuery={props.location.search}/>
                        </div>
                        <div className="col-sm-8">
                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <PersonSelector/>
                                </div>
                            </div>
                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <WidgetArea urlQuery={props.location.search} history={props.history}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <WelcomeModal show={showPopup} onHide={handleClosePopup}/>
                <DataSavedModal show={useSelector((state) => state.display.dataSaved).showMessage} goToNextSection={goToNextSection}
                                success={useSelector((state) => state.display.dataSaved).success}
                                last_widget={useSelector((state) => state.display.dataSaved).lastWidget}/>
                <SectionsNotCompletedModal show={useSelector((state) => state.display.sectionsNotCompleted)}
                                           onHide={() => dispatch(hideSectionsNotCompleted())}
                                           sections={[
                                               useSelector((state) => state.overview.isSavedToDB) ? -1 : WIDGET.OVERVIEW,
                                               useSelector((state) => state.genetics.isSavedToDB) ? -1 : WIDGET.GENETICS,
                                               useSelector((state) => state.reagent.isSavedToDB) ? -1 : WIDGET.REAGENT,
                                               useSelector((state) => state.expression.isSavedToDB) ? -1 : WIDGET.EXPRESSION,
                                               useSelector((state) => state.interactions.isSavedToDB) ? -1 : WIDGET.INTERACTIONS,
                                               useSelector((state) => state.phenotypes.isSavedToDB) ? -1 : WIDGET.PHENOTYPES,
                                               useSelector((state) => state.disease.isSavedToDB) ? -1 : WIDGET.DISEASE,
                                               useSelector((state) => state.comments.isSavedToDB) ? -1 : WIDGET.COMMENTS
                                           ].filter((widgetIdx) => widgetIdx !== -1 && widgetIdx !== WIDGET.COMMENTS).map((idx) => WIDGET_TITLE[idx])}/>
            </div>
        </div>
    );
}

export default withRouter(MenuAndWidgets);
