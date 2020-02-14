import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import Overview from "../../widgets/Overview";
import Expression from "../../widgets/Expression";
import {Alert, Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Reagent from "../../widgets/Reagent";
import Phenotypes from "../../widgets/Phenotypes";
import Interactions from "../../widgets/Interactions";
import Genetics from "../../widgets/Genetics";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import ContactInfo from "../../widgets/Comments";
import queryString from 'query-string';
import Title from "../Title";
import Disease from "../../widgets/Disease";
import Header from "../Header";
import {
    AFPValues,
    getCheckboxDBVal,
    transformEntitiesIntoAfpString
} from "../../AFPValues";
import {DataSavedModal, SectionsNotCompletedModal, WelcomeModal} from "../MainModals";
import PersonSelector from "../PersonSelector";
import LoadingOverlay from 'react-loading-overlay';
import {DataManager} from "../../lib/DataManager";
import {MENU_INDEX, WIDGET, WIDGET_TITLE} from "./constants";
import {connect} from "react-redux";
import {setGeneModel, setGenes, setSpecies, setIsOverviewSavedToDB} from "../../redux/actions/overviewActions";
import {setPerson} from "../../redux/actions/personActions";
import {isOverviewSavedToDB} from "../../redux/selectors/overviewSelectors";
import {
    setAlleles, setIsGeneticsSavedToDB,
    setOtherAlleles,
    setOtherStrains,
    setSequenceChange,
    setStrains
} from "../../redux/actions/geneticsActions";
import {isGeneticsSavedToDB} from "../../redux/selectors/geneticsSelectors";

class MenuAndWidgets extends React.Component {
    constructor(props) {
        super(props);
        let currSelectedMenu = MENU_INDEX[WIDGET.OVERVIEW];
        const currentLocation = props.location.pathname;
        if (currentLocation !== "" && currentLocation !== "/") {
            currSelectedMenu = MENU_INDEX[currentLocation.substring(1)];
        }
        let parameters = queryString.parse(this.props.location.search);
        let completedSections = {};
        Object.values(WIDGET).forEach((key) => {completedSections[key] = false;});
        this.state = {
            dataManager: new DataManager(process.env.REACT_APP_API_READ_ENDPOINT + '&paper=' +
                parameters.paper + '&passwd=' + parameters.passwd, process.env.REACT_APP_API_DB_READ_ENDPOINT),
            pages: [WIDGET.OVERVIEW, WIDGET.GENETICS, WIDGET.REAGENT, WIDGET.EXPRESSION, WIDGET.INTERACTIONS,
                WIDGET.PHENOTYPES, WIDGET.DISEASE, WIDGET.COMMENTS],
            selectedMenu: currSelectedMenu,
            completedSections: completedSections,
            showPopup: true,
            paper_id: parameters.paper,
            passwd: parameters.passwd,
            personid: parameters.personid,
            show_fetch_data_error: false,
            show_data_saved: false,
            data_saved_success: true,
            data_saved_last_widget: false,
            selectedStrains: new Set(),
            selectedTransgenes: new Set(),
            newAntib: false,
            otherAntibs: [ { id: 1, name: "", publicationId: "" } ],
            otherTransgenes: [ { id: 1, name: "" } ],
            newAntibDetails: "",
            anatomicExpr: false,
            anatomicExprDetails: "",
            siteAction: false,
            siteActionDetails: "",
            timeAction: false,
            timeActionDetails: "",
            rnaSeq: false,
            rnaSeqDetails: "",
            additionalExpr: "",
            svmGeneInt: false,
            svmGeneIntDetails: "",
            svmPhysInt: false,
            svmPhysIntDetails: "",
            svmGeneReg: false,
            svmGeneRegDetails: "",
            svmAllele: false,
            svmTransgene: false,
            svmRNAi: false,
            svmProtein: false,
            svmProteinDetails: "",
            chemical:false,
            env: false,
            other: "",
            humDis: false,
            disComments: "",
            show_sections_not_completed: false,
            hideGenes: parameters.hide_genes === "true",
            hideAlleles: parameters.hide_alleles === "true",
            hideStrains: parameters.hide_strains === "true",
            isLoading: false
        };
        this.handleSelectMenu = this.handleSelectMenu.bind(this);
        this.handleFinishedSection = this.handleFinishedSection.bind(this);
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.setWidgetSaved = this.setWidgetSaved.bind(this);
        this.goToNextSection = this.goToNextSection.bind(this);
        this.enableEntityListVisibility = this.enableEntityListVisibility.bind(this);
    }

    /**
     * change a widget state to saved and modify its alert message depending on the status of the passed arguments
     * @param widget the widget to modify
     * @param {string} sectionName
     * @param {AFPValues} params a list of arguments
     */
    setWidgetSaved(widget, sectionName, ...params) {
        let saved = params[0].prevSaved();
        for (let i = 1; i < params.length; i++) {
            saved = saved && params[i].prevSaved();
        }
        if (widget !== undefined) {
            widget.selfStateVarModifiedFunction(saved, "saved");
            if (saved) {
                widget.setSuccessAlertMessage();
            }
        }
        const newCompletedSections = this.state.completedSections;
        newCompletedSections[sectionName] = saved;
        this.setState({
            completedSections: newCompletedSections
        });
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

    componentDidMount() {
        this.state.dataManager.getPaperData()
            .then(() => {
                console.log("Data successfully loaded from WB API (postgres)");
                // overview
                this.props.setGenes(this.state.dataManager.genesList.entities(),
                    this.state.dataManager.genesList.prevSaved());
                this.props.setSpecies(this.state.dataManager.speciesList.entities(),
                    this.state.dataManager.speciesList.prevSaved());
                this.props.setGeneModel(this.state.dataManager.structCorrcb.isChecked(),
                    this.state.dataManager.structCorrcb.details());
                if (this.state.dataManager.genesList.prevSaved() && this.state.dataManager.speciesList.prevSaved()) {
                    this.props.setIsOverviewSavedToDB();
                }

                // genetics
                this.props.setAlleles(this.state.dataManager.variationsList.entities(),
                    this.state.dataManager.variationsList.prevSaved());
                this.props.setStrains(this.state.dataManager.strainsList.entities(),
                    this.state.dataManager.strainsList.prevSaved());
                this.props.setSequenceChange(this.state.dataManager.seqChange.isChecked(),
                    this.state.dataManager.seqChange.details());
                this.props.setOtherAlleles(this.state.dataManager.otherVariations.entities(),
                    this.state.dataManager.otherVariations.prevSaved());
                this.props.setOtherStrains(this.state.dataManager.otherStrains.entities(),
                    this.state.dataManager.otherStrains.prevSaved());
                if (this.state.dataManager.variationsList.prevSaved() && this.state.dataManager.strainsList.prevSaved()) {
                    this.props.setIsGeneticsSavedToDB();
                }
            })
            .catch(() => {this.setState({show_fetch_data_error: true})});

        this.state.dataManager.getPersonData(this.state.passwd, this.state.personid)
            .then(() => {
                this.props.setPerson(this.state.dataManager.person.name, this.state.dataManager.person.personId);
            })
            .catch(() => {
                this.setState({show_fetch_data_error: true})
            });

    }

    handleSelectMenu(selected) {
        this.setState({
            selectedMenu: selected
        });
    }

    allSectionsFinished() {
        return Object.keys(this.state.completedSections).filter((item) => item !== WIDGET.COMMENTS).every(item => this.state.completedSections[item]);
    }

    handleFinishedSection(widget) {
        this.setState({isLoading: true});
        if (widget !== WIDGET.COMMENTS || this.allSectionsFinished()) {
            if (widget === WIDGET.COMMENTS) {
                // manually change alert for last widget
                this.other.setSuccessAlertMessage();
            }
            let payload = {};
            switch (widget) {
                case WIDGET.OVERVIEW:
                    payload = {
                        gene_list: transformEntitiesIntoAfpString(this.state.selectedGenes, "WBGene"),
                        gene_model_update: getCheckboxDBVal(this.state.geneModCorrection,
                            this.state.geneModCorrectionDetails),
                        species_list: transformEntitiesIntoAfpString(this.state.selectedSpecies, ""),
                    };
                    break;
                case WIDGET.GENETICS:
                    payload = {
                        alleles_list: transformEntitiesIntoAfpString(this.state.selectedAlleles, ""),
                        allele_seq_change: getCheckboxDBVal(this.state.alleleSeqChange),
                        other_alleles: JSON.stringify(this.state.otherAlleles),
                        strains_list: transformEntitiesIntoAfpString(this.state.selectedStrains, ""),
                        other_strains: JSON.stringify(this.state.otherStrains)
                    };
                    break;
                case WIDGET.REAGENT:
                    payload = {
                        transgenes_list: transformEntitiesIntoAfpString(this.state.selectedTransgenes, ""),
                        new_transgenes: JSON.stringify(this.state.otherTransgenes),
                        new_antibody: getCheckboxDBVal(this.state.newAntib, this.state.newAntibDetails),
                        other_antibodies: JSON.stringify(this.state.otherAntibs)
                    };
                    break;
                case WIDGET.EXPRESSION:
                    payload = {
                        anatomic_expr: getCheckboxDBVal(this.state.anatomicExpr,
                            this.state.anatomicExprDetails),
                        site_action: getCheckboxDBVal(this.state.siteAction, this.state.siteActionDetails),
                        time_action: getCheckboxDBVal(this.state.timeAction, this.state.timeActionDetails),
                        rnaseq: getCheckboxDBVal(this.state.rnaSeq, this.state.rnaSeqDetails),
                        additional_expr: this.state.additionalExpr
                    };
                    break;
                case WIDGET.INTERACTIONS:
                    payload = {
                        gene_int: getCheckboxDBVal(this.state.svmGeneInt, this.state.svmGeneIntDetails),
                        phys_int: getCheckboxDBVal(this.state.svmPhysInt, this.state.svmPhysIntDetails),
                        gene_reg: getCheckboxDBVal(this.state.svmGeneReg, this.state.svmGeneRegDetails),
                    };
                    break;
                case WIDGET.PHENOTYPES:
                    payload = {
                        allele_pheno: getCheckboxDBVal(this.state.svmAllele),
                        rnai_pheno: getCheckboxDBVal(this.state.svmRNAi),
                        transover_pheno: getCheckboxDBVal(this.state.svmTransgene),
                        chemical: getCheckboxDBVal(this.state.chemical),
                        env: getCheckboxDBVal(this.state.env),
                        protein: getCheckboxDBVal(this.state.svmProtein, this.state.svmProteinDetails),
                    };
                    break;
                case WIDGET.DISEASE:
                    payload = {
                        disease: getCheckboxDBVal(this.state.humDis, this.state.disComments),
                    };
                    break;
                case WIDGET.COMMENTS:
                    payload = {
                        comments: this.state.other,
                        person_id: "two" + this.state.personid
                    };
                    break;
            }
            payload.passwd = this.state.passwd;
            this.state.dataManager.fetchPOSTData(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, payload)
                .then(() => {
                    this.setState({
                        show_data_saved: true,
                        data_saved_success: true,
                        isLoading: false,
                        data_saved_last_widget: widget === WIDGET.COMMENTS
                    });
                    const newCompletedSections = this.state.completedSections;
                    newCompletedSections[widget] = true;
                    this.setState({completedSections: newCompletedSections});
                })
                .catch(() => {
                    this.setState({
                        show_data_saved: true,
                        data_saved_success: false,
                        isLoading: false
                    });
                });
        } else {
            this.setState({
                show_sections_not_completed: true
            });
        }
    }

    goToNextSection() {
        const newSelectedMenu = Math.min(this.state.selectedMenu + 1, this.state.pages.length);
        this.setState({selectedMenu: newSelectedMenu, show_data_saved: false});
        this.props.history.push(this.state.pages[newSelectedMenu - 1] + this.props.location.search);
        window.scrollTo(0, 0)
    }

    handleClosePopup() {
        this.setState({showPopup: false})
    }

    toggle_cb(cbName, mainCompVarName) {
        let newVal = !this.state[cbName];
        let newStateElem = {};
        newStateElem[cbName] = newVal;
        this.setState(newStateElem);
        this.props.stateVarModifiedCallback(newVal, mainCompVarName);
    }

    check_cb(cbName, mainCompVarName) {
        let newStateElem = {};
        newStateElem[cbName] = true;
        this.setState(newStateElem);
        this.props.stateVarModifiedCallback(true, mainCompVarName);
    }

    render() {
        let expressionOk = this.state.completedSections[WIDGET.EXPRESSION] ? <Glyphicon glyph="ok"/> : false;
        let interactionsOk = this.state.completedSections[WIDGET.INTERACTIONS] ? <Glyphicon glyph="ok"/> : false;
        let phenotypesOk = this.state.completedSections[WIDGET.PHENOTYPES] ? <Glyphicon glyph="ok"/> : false;
        let reagentOk = this.state.completedSections[WIDGET.REAGENT] ? <Glyphicon glyph="ok"/> : false;
        let diseaseOk = this.state.completedSections[WIDGET.DISEASE] ? <Glyphicon glyph="ok"/> : false;
        let contact_infoOk = this.state.completedSections[WIDGET.COMMENTS] ? <Glyphicon glyph="ok"/> : false;
        let data_fetch_err_alert = this.state.show_fetch_data_error ?
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
                    <Header />
                    <Title title={title} journal={parameters.journal} pmid={parameters.pmid} doi={parameters.doi}/><br/>
                    <div>
                        <div>
                            <div className="col-sm-4">
                                <div className="panel panel-default">
                                    <div className="panel-body">
                                        <Nav bsStyle="pills" stacked onSelect={this.handleSelectMenu}>
                                            <IndexLinkContainer to={WIDGET.OVERVIEW + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.OVERVIEW]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.OVERVIEW]}>{WIDGET_TITLE[WIDGET.OVERVIEW]}
                                                    &nbsp;{this.props.isOverviewSavedToDB ? <Glyphicon glyph="ok"/> : false}
                                                </NavItem></IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.GENETICS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.GENETICS]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.GENETICS]}>{WIDGET_TITLE[WIDGET.GENETICS]}
                                                &nbsp;{this.props.isGeneticsSavedToDB ? <Glyphicon glyph="ok"/> : false}
                                                </NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.REAGENT + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.REAGENT]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.REAGENT]}>{WIDGET_TITLE[WIDGET.REAGENT]}&nbsp;{reagentOk}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.EXPRESSION + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.EXPRESSION]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.EXPRESSION]}>{WIDGET_TITLE[WIDGET.EXPRESSION]}&nbsp;{expressionOk}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.INTERACTIONS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.INTERACTIONS]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.INTERACTIONS]}>{WIDGET_TITLE[WIDGET.INTERACTIONS]}&nbsp;{interactionsOk}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.PHENOTYPES + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.PHENOTYPES]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.PHENOTYPES]}>{WIDGET_TITLE[WIDGET.PHENOTYPES]}&nbsp;{phenotypesOk}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.DISEASE + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.DISEASE]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.DISEASE]}>{WIDGET_TITLE[WIDGET.DISEASE]}&nbsp;{diseaseOk}</NavItem>
                                            </IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.COMMENTS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.COMMENTS]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.COMMENTS]}>{WIDGET_TITLE[WIDGET.COMMENTS]}&nbsp;{contact_infoOk}</NavItem>
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
                                            active={this.state.isLoading}
                                            spinner
                                            text='Sending data ...'
                                        >
                                            <Route exact path="/" render={() => (<Redirect to={"/overview" + this.props.location.search}/>)}/>
                                            <Route path={"/" + WIDGET.OVERVIEW}
                                                   render={() => <Overview callback={this.handleFinishedSection}
                                                                           hideGenes={this.state.hideGenes}
                                                                           toggleEntityVisibilityCallback={this.enableEntityListVisibility}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.GENETICS}
                                                   render={() => <Genetics  callback={this.handleFinishedSection}
                                                                            hideAlleles={this.state.hideAlleles}
                                                                            hideStrains={this.state.hideStrains}
                                                                            toggleEntityVisibilityCallback={this.enableEntityListVisibility}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.REAGENT}
                                                   render={() => <Reagent callback={this.handleFinishedSection}
                                                                          saved={this.state.completedSections[WIDGET.REAGENT]}
                                                                          selectedTransgenes={this.state.selectedTransgenes}
                                                                          stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                          newAntib={this.state.newAntib}
                                                                          newAntibDetails={this.state.newAntibDetails}
                                                                          otherAntibs={this.state.otherAntibs}
                                                                          otherTransgenes={this.state.otherTransgenes}
                                                                          toggleCb={this.toggle_cb}
                                                                          checkCb={this.check_cb}
                                                                          ref={instance => { this.reagent = instance; }}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.EXPRESSION}
                                                   render={() => <Expression callback={this.handleFinishedSection}
                                                                             saved={this.state.completedSections[WIDGET.EXPRESSION]}
                                                                             anatomicExpr={this.state.anatomicExpr}
                                                                             anatomicExprDetails={this.state.anatomicExprDetails}
                                                                             siteAction={this.state.siteAction}
                                                                             siteActionDetails={this.state.siteActionDetails}
                                                                             timeAction={this.state.timeAction}
                                                                             timeActionDetails={this.state.timeActionDetails}
                                                                             rnaSeq={this.state.rnaSeq}
                                                                             rnaSeqDetails={this.state.rnaSeqDetails}
                                                                             additionalExpr={this.state.additionalExpr}
                                                                             stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                             selfStateVarModifiedFunction={this.stateVarModifiedCallback}
                                                                             toggleCb={this.toggle_cb}
                                                                             checkCb={this.check_cb}
                                                                             ref={instance => { this.expression = instance; }}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.INTERACTIONS}
                                                   render={() => <Interactions
                                                       callback={this.handleFinishedSection}
                                                       saved={this.state.completedSections[WIDGET.INTERACTIONS]}
                                                       ref={instance => { this.interactions = instance; }}
                                                       cb_genetic={this.state.svmGeneInt}
                                                       cb_physical={this.state.svmPhysInt}
                                                       cb_regulatory={this.state.svmGeneReg}
                                                       cb_genetic_details={this.state.svmGeneIntDetails}
                                                       cb_physical_details={this.state.svmPhysIntDetails}
                                                       cb_regulatory_details={this.state.svmGeneRegDetails}
                                                       stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                       toggleCb={this.toggle_cb}
                                                       checkCb={this.check_cb}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.PHENOTYPES}
                                                   render={() => <Phenotypes
                                                       callback={this.handleFinishedSection}
                                                       saved={this.state.completedSections[WIDGET.PHENOTYPES]}
                                                       cb_allele={this.state.svmAllele}
                                                       cb_rnai={this.state.svmRNAi}
                                                       cb_transgene={this.state.svmTransgene}
                                                       cb_protein={this.state.svmProtein}
                                                       cb_transgene_details={this.state.svmTransgeneDetails}
                                                       cb_protein_details={this.state.svmProteinDetails}
                                                       cb_chemical={this.state.chemical}
                                                       cb_env={this.state.env}
                                                       stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                       ref={instance => { this.phenotype = instance; }}
                                                       toggleCb={this.toggle_cb}
                                                       checkCb={this.check_cb}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.DISEASE}
                                                   render={() => <Disease callback={this.handleFinishedSection}
                                                                          saved={this.state.completedSections[WIDGET.DISEASE]}
                                                                          humDis={this.state.humDis}
                                                                          comments={this.state.disComments}
                                                                          stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                          toggleCb={this.toggle_cb}
                                                                          checkCb={this.check_cb}
                                                                          ref={instance => { this.disease = instance; }}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.COMMENTS} render={() => <ContactInfo
                                                callback={this.handleFinishedSection}
                                                saved={this.state.completedSections[WIDGET.COMMENTS]}
                                                other={this.state.other}
                                                stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                personId={this.state.personid}
                                                ref={instance => { this.other = instance; }}
                                            />}/>
                                        </LoadingOverlay>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <WelcomeModal show={this.state.showPopup} onHide={this.handleClosePopup} />
                    <DataSavedModal show={this.state.show_data_saved} onHide={this.goToNextSection}
                                    success={this.state.data_saved_success} last_widget={this.state.data_saved_last_widget}/>
                    <SectionsNotCompletedModal show={this.state.show_sections_not_completed}
                                               onHide={() => this.setState({show_sections_not_completed: false})}
                                               sections={Object.keys(this.state.completedSections).filter((sec) => !this.state.completedSections[sec] && sec !== WIDGET.COMMENTS).map((sec) => WIDGET_TITLE[sec])}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isOverviewSavedToDB: isOverviewSavedToDB(state),
    isGeneticsSavedToDB: isGeneticsSavedToDB(state)
});

export default connect(mapStateToProps, {setGenes, setSpecies, setGeneModel, setPerson, setIsOverviewSavedToDB,
    setAlleles, setStrains, setSequenceChange, setOtherAlleles, setOtherStrains, setIsGeneticsSavedToDB})(withRouter(MenuAndWidgets));