import React from 'react';
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
import Button from "react-bootstrap/lib/Button";

class MenuAndWidgets extends React.Component {
    constructor(props) {
        super(props);
        let currSelectedMenu = MENU_INDEX[WIDGET.OVERVIEW];
        const currentLocation = props.location.pathname;
        if (currentLocation !== "" && currentLocation !== "/") {
            currSelectedMenu = MENU_INDEX[currentLocation.substring(1)];
        }
        let parameters = queryString.parse(this.props.location.search);
        this.state = {
            pages: [WIDGET.OVERVIEW, WIDGET.GENETICS, WIDGET.REAGENT, WIDGET.EXPRESSION, WIDGET.INTERACTIONS,
                WIDGET.PHENOTYPES, WIDGET.DISEASE, WIDGET.COMMENTS],
            selectedMenu: currSelectedMenu,
            showPopup: true,
            hideGenes: parameters.hide_genes === "true",
            hideAlleles: parameters.hide_alleles === "true",
            hideStrains: parameters.hide_strains === "true"
        };
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.goToNextSection = this.goToNextSection.bind(this);
        this.enableEntityListVisibility = this.enableEntityListVisibility.bind(this);
    }

    enableEntityListVisibility(entityType) {
        let curParams = queryString.parse(this.props.location.search);
        curParams[entityType] = "false";
        this.props.history.push(this.state.pages[this.state.selectedMenu - 1] + "?" + queryString.stringify(curParams));
        this.setState({
            hideGenes: curParams["hide_genes"] === "true",
            hideAlleles: curParams["hide_alleles"] === "true",
            hideStrains: curParams["hide_strains"] === "true"
        });
    }

    goToNextSection() {
        const newSelectedMenu = Math.min(this.state.selectedMenu + 1, this.state.pages.length);
        this.setState({selectedMenu: newSelectedMenu});
        this.props.hideDataSaved();
        this.props.history.push(this.state.pages[newSelectedMenu - 1] + this.props.location.search);
        window.scrollTo(0, 0)
    }

    handleClosePopup() {
        this.setState({showPopup: false})
    }

    render() {
        let data_fetch_err_alert = this.props.fetchDataError ?
            <Alert bsStyle="danger">
                <Glyphicon glyph="warning-sign"/>
                <strong>Error</strong><br/>
                We are having problems retrieving your data from the server and some components may
                behave incorrectly. This could be caused by wrong credentials or by a network issue.
                Please try again later or contact <a href="mailto:help@wormbase.org">
                Wormbase Helpdesk</a>.
            </Alert> : false;
        let parameters = queryString.parse(this.props.location.search);
        let title = parameters.title !== undefined ? "\"" + parameters.title + "\"" : "";
        return (
            <div className="container">
                <div className="row">
                    {data_fetch_err_alert}
                    <div id="whiteBanner"/>
                    <Header/>
                    <div align="right"><a href="mailto:help.afp@wormbase.org"><Button bsStyle="secondary">Contact us</Button></a></div>
                    <Title title={title} journal={parameters.journal} pmid={parameters.pmid} doi={parameters.doi}/><br/>
                    <div>
                        <div>
                            <div className="col-sm-4">
                                <div className="panel panel-default">
                                    <div className="panel-body">
                                        <Nav bsStyle="pills" stacked onSelect={(sel) => this.setState({selectedMenu: sel})}>
                                            <IndexLinkContainer to={WIDGET.OVERVIEW + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.OVERVIEW]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.OVERVIEW]}>{WIDGET_TITLE[WIDGET.OVERVIEW]}
                                                    &nbsp;{this.props.isOverviewSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}
                                                </NavItem></IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.GENETICS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.GENETICS]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.GENETICS]}>{WIDGET_TITLE[WIDGET.GENETICS]}
                                                    &nbsp;{this.props.isGeneticsSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}
                                                </NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.REAGENT + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.REAGENT]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.REAGENT]}>{WIDGET_TITLE[WIDGET.REAGENT]}
                                                    &nbsp;{this.props.isReagentSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.EXPRESSION + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.EXPRESSION]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.EXPRESSION]}>{WIDGET_TITLE[WIDGET.EXPRESSION]}
                                                    &nbsp;{this.props.isExpressionSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.INTERACTIONS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.INTERACTIONS]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.INTERACTIONS]}>{WIDGET_TITLE[WIDGET.INTERACTIONS]}
                                                    &nbsp;{this.props.isInteractionsSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.PHENOTYPES + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.PHENOTYPES]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.PHENOTYPES]}>{WIDGET_TITLE[WIDGET.PHENOTYPES]}
                                                    &nbsp;{this.props.isPhenotypesSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.DISEASE + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.DISEASE]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.DISEASE]}>{WIDGET_TITLE[WIDGET.DISEASE]}&nbsp;
                                                    {this.props.isDiseaseSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.COMMENTS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.COMMENTS]}>
                                                <NavItem
                                                    eventKey={MENU_INDEX[WIDGET.COMMENTS]}>{WIDGET_TITLE[WIDGET.COMMENTS]}
                                                    &nbsp;{this.props.isCommentsSavedToDB ?
                                                        <Glyphicon glyph="ok"/> : false}</NavItem>
                                            </IndexLinkContainer>
                                        </Nav>
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
                                            active={this.props.isLoading}
                                            spinner
                                            text='Sending data ...'
                                        >
                                            <Route exact path="/" render={() => (
                                                <Redirect to={"/overview" + this.props.location.search}/>)}/>
                                            <Route path={"/" + WIDGET.OVERVIEW}
                                                   render={() => <Overview hideGenes={this.state.hideGenes}
                                                                           toggleEntityVisibilityCallback={this.enableEntityListVisibility}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.GENETICS}
                                                   render={() => <Genetics hideAlleles={this.state.hideAlleles}
                                                                           hideStrains={this.state.hideStrains}
                                                                           toggleEntityVisibilityCallback={this.enableEntityListVisibility}
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
                                        </LoadingOverlay>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <WelcomeModal show={this.state.showPopup} onHide={this.handleClosePopup}/>
                    <DataSavedModal show={this.props.dataSaved.showMessage} goToNextSection={this.goToNextSection}
                                    success={this.props.dataSaved.success}
                                    last_widget={this.props.dataSaved.lastWidget}/>
                    <SectionsNotCompletedModal show={this.props.sectionsNotCompleted}
                                               onHide={() => this.props.hideSectionsNotCompleted()}
                                               sections={[this.props.isOverviewSavedToDB ? -1 : WIDGET.OVERVIEW, this.props.isGeneticsSavedToDB ? -1 : WIDGET.GENETICS, this.props.isReagentSavedToDB ? -1 : WIDGET.REAGENT, this.props.isExpressionSavedToDB ? -1 : WIDGET.EXPRESSION, this.props.isInteractionsSavedToDB ? -1 : WIDGET.INTERACTIONS, this.props.isPhenotypesSavedToDB ? -1 : WIDGET.PHENOTYPES, this.props.isDiseaseSavedToDB ? -1 : WIDGET.DISEASE, this.props.isCommentsSavedToDB ? -1 : WIDGET.COMMENTS].filter((widgetIdx) => widgetIdx !== -1 && widgetIdx !== WIDGET.COMMENTS).map((idx) => WIDGET_TITLE[idx])}/>
                </div>
            </div>
        );
    }
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