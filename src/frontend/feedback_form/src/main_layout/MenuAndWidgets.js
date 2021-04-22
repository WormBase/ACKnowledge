import React, {useState} from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import Overview from "../widgets/Overview";
import Expression from "../widgets/Expression";
import {Alert, Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Reagent from "../widgets/Reagent";
import Phenotypes from "../widgets/Phenotypes";
import Interactions from "../widgets/Interactions";
import Genetics from "../widgets/Genetics";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import ContactInfo from "../widgets/Comments";
import queryString from 'query-string';
import Title from "./Title";
import Disease from "../widgets/Disease";
import Header from "./Header";
import {SectionsNotCompletedModal, WelcomeModal} from "./MainModals";
import DataSavedModal from "./DataSavedModal";
import PersonSelector from "./PersonSelector";
import LoadingOverlay from 'react-loading-overlay';
import {MENU_INDEX, WIDGET, WIDGET_TITLE} from "../constants";
import {connect} from "react-redux";
import {isOverviewSavedToDB} from "../redux/selectors/overviewSelectors";
import {isGeneticsSavedToDB} from "../redux/selectors/geneticsSelectors";
import {isReagentSavedToDB} from "../redux/selectors/reagentSelectors";
import {isExpressionSavedToDB} from "../redux/selectors/expressionSelectors";
import {isInteractionsSavedToDB} from "../redux/selectors/interactionsSelectors";
import {isPhenotypesSavedToDB} from "../redux/selectors/phenotypesSelectors";
import {isDiseaseSavedToDB} from "../redux/selectors/diseaseSelectors";
import {isCommentsSavedToDB} from "../redux/selectors/commentsSelectors";
import {
    getDataFetchError,
    getDataSaved,
    getIsLoading,
    getSectionsNotCompleted
} from "../redux/selectors/displaySelectors";
import {hideDataSaved, hideSectionsNotCompleted} from "../redux/actions/displayActions";
import FAQ from "../widgets/FAQ";
import ReleaseNotes from "../widgets/ReleaseNotes";

const MenuAndWidgets = (props) => {
    let currSelectedMenu = MENU_INDEX[WIDGET.OVERVIEW];
    const currentLocation = props.location.pathname;
    if (currentLocation !== "" && currentLocation !== "/") {
        currSelectedMenu = MENU_INDEX[currentLocation.substring(1)];
    }
    let parameters = queryString.parse(props.location.search);

    const [pages, setPages] = useState([WIDGET.OVERVIEW, WIDGET.GENETICS, WIDGET.REAGENT, WIDGET.EXPRESSION,
        WIDGET.INTERACTIONS, WIDGET.PHENOTYPES, WIDGET.DISEASE, WIDGET.COMMENTS]);
    const [selectedMenu, setSelectedMenu] = useState(currSelectedMenu);
    const [showPopup, setShowPopup] = useState(true);
    const [hideGenes, setHideGenes] = useState(parameters.hide_genes === "true");
    const [hideAlleles, setHideAlleles] = useState(parameters.hide_alleles === "true");
    const [hideStrains, setHideStrains] = useState(parameters.hide_strains === "true");

    const enableEntityListVisibility = (entityType) => {
        let curParams = queryString.parse(props.location.search);
        curParams[entityType] = "false";
        props.history.push(pages[selectedMenu - 1] + "?" + queryString.stringify(curParams));
        setHideGenes(curParams["hide_genes"] === "true");
        setHideAlleles(curParams["hide_alleles"] === "true");
        setHideStrains(curParams["hide_strains"] === "true");
    }

    const goToNextSection = () => {
        const newSelectedMenu = Math.min(selectedMenu + 1, pages.length);
        setSelectedMenu(newSelectedMenu);
        props.hideDataSaved();
        props.history.push(pages[newSelectedMenu - 1] + props.location.search);
        window.scrollTo(0, 0)
    }

    const handleClosePopup = () => {
        setShowPopup(false);
    }

    let data_fetch_err_alert = props.fetchDataError ?
        <Alert bsStyle="danger">
            <Glyphicon glyph="warning-sign"/>
            <strong>Error</strong><br/>
            We are having problems retrieving your data from the server and some components may
            behave incorrectly. This could be caused by wrong credentials or by a network issue.
            Please try again later or contact <a href="mailto:help@wormbase.org">
            Wormbase Helpdesk</a>.
        </Alert> : false;
    let title = parameters.title !== undefined ? "\"" + parameters.title + "\"" : "";
    return (
        <div className="container">
            <div className="row">
                {data_fetch_err_alert}
                <div id="whiteBanner"/>
                <Header {...props}/>
                <Title title={title} journal={parameters.journal} pmid={parameters.pmid} doi={parameters.doi}/><br/>
                <div>
                    <div>
                        <div className="col-sm-4">
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm-4">
                                        <div className="panel panel-default">
                                            <div className="panel-body">
                                                <Nav bsStyle="pills" stacked onSelect={(sel) => setSelectedMenu(sel)}>
                                                    <IndexLinkContainer to={WIDGET.OVERVIEW + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.OVERVIEW]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.OVERVIEW]}>{WIDGET_TITLE[WIDGET.OVERVIEW]}
                                                            &nbsp;{props.isOverviewSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}
                                                        </NavItem></IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.GENETICS + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.GENETICS]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.GENETICS]}>{WIDGET_TITLE[WIDGET.GENETICS]}
                                                            &nbsp;{props.isGeneticsSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}
                                                        </NavItem>
                                                    </IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.REAGENT + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.REAGENT]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.REAGENT]}>{WIDGET_TITLE[WIDGET.REAGENT]}
                                                            &nbsp;{props.isReagentSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}</NavItem>
                                                    </IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.EXPRESSION + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.EXPRESSION]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.EXPRESSION]}>{WIDGET_TITLE[WIDGET.EXPRESSION]}
                                                            &nbsp;{props.isExpressionSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}</NavItem>
                                                    </IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.INTERACTIONS + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.INTERACTIONS]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.INTERACTIONS]}>{WIDGET_TITLE[WIDGET.INTERACTIONS]}
                                                            &nbsp;{props.isInteractionsSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}</NavItem>
                                                    </IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.PHENOTYPES + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.PHENOTYPES]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.PHENOTYPES]}>{WIDGET_TITLE[WIDGET.PHENOTYPES]}
                                                            &nbsp;{props.isPhenotypesSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}</NavItem>
                                                    </IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.DISEASE + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.DISEASE]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.DISEASE]}>{WIDGET_TITLE[WIDGET.DISEASE]}&nbsp;
                                                            {props.isDiseaseSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}</NavItem>
                                                    </IndexLinkContainer>
                                                    <IndexLinkContainer to={WIDGET.COMMENTS + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.COMMENTS]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.COMMENTS]}>{WIDGET_TITLE[WIDGET.COMMENTS]}
                                                            &nbsp;{props.isCommentsSavedToDB ?
                                                                <Glyphicon glyph="ok"/> : false}</NavItem>
                                                    </IndexLinkContainer>
                                                </Nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <div className="panel panel-default">
                                            <div className="panel-body">
                                                <Nav bsStyle="pills" stacked onSelect={(sel) => setSelectedMenu(sel)}>
                                                    <IndexLinkContainer to={WIDGET.HELP + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.HELP]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.HELP]}>{WIDGET_TITLE[WIDGET.HELP]}
                                                        </NavItem></IndexLinkContainer>
                                                    <NavItem href="https://www.youtube.com/embed/ZONK4qe_-w8?start=86&end=1011" target="_blank">WormBase AFP Webinar</NavItem>
                                                    <IndexLinkContainer to={WIDGET.RELEASE_NOTES + props.location.search}
                                                                        active={selectedMenu === MENU_INDEX[WIDGET.RELEASE_NOTES]}>
                                                        <NavItem
                                                            eventKey={MENU_INDEX[WIDGET.RELEASE_NOTES]}>{WIDGET_TITLE[WIDGET.RELEASE_NOTES]}
                                                        </NavItem></IndexLinkContainer>
                                                </Nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-8">
                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <PersonSelector/>
                                </div>
                            </div>
                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <LoadingOverlay
                                        active={props.isLoading}
                                        spinner
                                        text='Sending data ...'
                                    >
                                        <Route exact path="/" render={() => (
                                            <Redirect to={"/overview" + props.location.search}/>)}/>
                                        <Route path={"/" + WIDGET.OVERVIEW}
                                               render={() => <Overview hideGenes={hideGenes}
                                                                       toggleEntityVisibilityCallback={enableEntityListVisibility}
                                               />}
                                        />
                                        <Route path={"/" + WIDGET.GENETICS}
                                               render={() => <Genetics hideAlleles={hideAlleles}
                                                                       hideStrains={hideStrains}
                                                                       toggleEntityVisibilityCallback={enableEntityListVisibility}
                                               />}
                                        />
                                        <Route path={"/" + WIDGET.REAGENT}
                                               render={() => <Reagent />}
                                        />
                                        <Route path={"/" + WIDGET.EXPRESSION}
                                               render={() => <Expression />}
                                        />
                                        <Route path={"/" + WIDGET.INTERACTIONS}
                                               render={() => <Interactions
                                               />}
                                        />
                                        <Route path={"/" + WIDGET.PHENOTYPES}
                                               render={() => <Phenotypes />}/>
                                        <Route path={"/" + WIDGET.DISEASE}
                                               render={() => <Disease />}/>
                                        <Route path={"/" + WIDGET.COMMENTS} render={() => <ContactInfo/>}/>
                                        <Route path={"/" + WIDGET.HELP} render={() => <FAQ/>}/>
                                        <Route path={"/" + WIDGET.RELEASE_NOTES} render={() => <ReleaseNotes/>}/>
                                    </LoadingOverlay>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <WelcomeModal show={showPopup} onHide={handleClosePopup}/>
                <DataSavedModal show={props.dataSaved.showMessage} goToNextSection={goToNextSection}
                                success={props.dataSaved.success}
                                last_widget={props.dataSaved.lastWidget}/>
                <SectionsNotCompletedModal show={props.sectionsNotCompleted}
                                           onHide={() => props.hideSectionsNotCompleted()}
                                           sections={[props.isOverviewSavedToDB ? -1 : WIDGET.OVERVIEW, props.isGeneticsSavedToDB ? -1 : WIDGET.GENETICS, props.isReagentSavedToDB ? -1 : WIDGET.REAGENT, props.isExpressionSavedToDB ? -1 : WIDGET.EXPRESSION, props.isInteractionsSavedToDB ? -1 : WIDGET.INTERACTIONS, props.isPhenotypesSavedToDB ? -1 : WIDGET.PHENOTYPES, props.isDiseaseSavedToDB ? -1 : WIDGET.DISEASE, props.isCommentsSavedToDB ? -1 : WIDGET.COMMENTS].filter((widgetIdx) => widgetIdx !== -1 && widgetIdx !== WIDGET.COMMENTS).map((idx) => WIDGET_TITLE[idx])}/>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    isOverviewSavedToDB: isOverviewSavedToDB(state),
    isGeneticsSavedToDB: isGeneticsSavedToDB(state),
    isReagentSavedToDB: isReagentSavedToDB(state),
    isExpressionSavedToDB: isExpressionSavedToDB(state),
    isInteractionsSavedToDB: isInteractionsSavedToDB(state),
    isPhenotypesSavedToDB: isPhenotypesSavedToDB(state),
    isDiseaseSavedToDB: isDiseaseSavedToDB(state),
    isCommentsSavedToDB: isCommentsSavedToDB(state),
    sectionsNotCompleted: getSectionsNotCompleted(state),
    dataSaved: getDataSaved(state),
    isLoading: getIsLoading(state),
    fetchDataError: getDataFetchError(state)
});

export default connect(mapStateToProps, {hideSectionsNotCompleted, hideDataSaved})(withRouter(MenuAndWidgets));