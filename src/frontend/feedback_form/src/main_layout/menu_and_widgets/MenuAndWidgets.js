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
import {
    setIsReagentSavedToDB,
    setNewAntibodies,
    setOtherAntibodies,
    setOtherTransgenes,
    setTransgenes
} from "../../redux/actions/reagentActions";
import {isReagentSavedToDB} from "../../redux/selectors/reagentSelectors";
import {
    setAdditionalExpr,
    setExpression, setIsExpressionSavedToDB,
    setRnaseq,
    setSiteOfAction,
    setTimeOfAction
} from "../../redux/actions/expressionActions";
import {isExpressionSavedToDB} from "../../redux/selectors/expressionSelectors";
import {
    setGeneticInteractions, setIsInteractionsSavedToDB,
    setPhysicalInteractions,
    setRegulatoryInteractions
} from "../../redux/actions/interactionsActions";
import {isInteractionsSavedToDB} from "../../redux/selectors/interactionsSelectors";
import {
    setAllelePhenotype,
    setChemicalPhenotype,
    setEnvironmentalPhenotype,
    setEnzymaticActivity,
    setIsPhenotypesSavedToDB,
    setOverexprPhenotype,
    setRnaiPhenotype,
    toggleAllelePhenotype,
    toggleChemicalPhenotype,
    toggleEnvironmentalPhenotype,
    toggleEnzymaticActivity,
    toggleRnaiPhenotype
} from "../../redux/actions/phenotypesActions";
import {isPhenotypesSavedToDB} from "../../redux/selectors/phenotypesSelectors";
import {setDisease, setIsDiseaseSavedToDB} from "../../redux/actions/diseaseActions";
import {isDiseaseSavedToDB} from "../../redux/selectors/diseaseSelectors";
import {isCommentsSavedToDB} from "../../redux/selectors/commentsSelectors";
import {setComments, setIsCommentsSavedToDB} from "../../redux/actions/commentsActions";

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
        Object.values(WIDGET).forEach((key) => {
            completedSections[key] = false;
        });
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
            show_data_saved: false,
            data_saved_success: true,
            data_saved_last_widget: false,
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

                // reagent
                this.props.setTransgenes(this.state.dataManager.transgenesList.entities());
                this.props.setOtherTransgenes(this.state.dataManager.otherTransgenesList.entities());
                this.props.setOtherAntibodies(this.state.dataManager.otherAntibodiesList.entities());
                this.props.setNewAntibodies(this.state.dataManager.newAntibodies.isChecked(),
                    this.state.dataManager.newAntibodies.details());
                if (this.state.dataManager.transgenesList.prevSaved() &&
                    this.state.dataManager.otherTransgenesList.prevSaved() &&
                    this.state.dataManager.otherAntibodiesList.prevSaved()) {
                    this.props.setIsReagentSavedToDB();
                }

                // expression
                this.props.setExpression(this.state.dataManager.expression.isChecked(),
                    this.state.dataManager.expression.details());
                this.props.setSiteOfAction(this.state.dataManager.siteOfAction.isChecked(),
                    this.state.dataManager.siteOfAction.details());
                this.props.setTimeOfAction(this.state.dataManager.timeOfAction.isChecked(),
                    this.state.dataManager.timeOfAction.details());
                this.props.setRnaseq(this.state.dataManager.rnaSeq.isChecked(),
                    this.state.dataManager.rnaSeq.details());
                this.props.setAdditionalExpr(this.state.dataManager.additionalExpr);
                if (this.state.dataManager.expression.prevSaved() && this.state.dataManager.siteOfAction.prevSaved() &&
                    this.state.dataManager.timeOfAction.prevSaved() && this.state.dataManager.rnaSeq.prevSaved() &&
                    this.state.dataManager.additionalExpr.prevSaved()) {
                    this.props.setIsExpressionSavedToDB();
                }

                // interactions
                this.props.setGeneticInteractions(this.state.dataManager.geneint.isChecked(), this.state.dataManager.geneint.details());
                this.props.setPhysicalInteractions(this.state.dataManager.geneprod.isChecked(), this.state.dataManager.geneprod.details());
                this.props.setRegulatoryInteractions(this.state.dataManager.genereg.isChecked(), this.state.dataManager.genereg.details());
                if (this.state.dataManager.geneint.prevSaved() && this.state.dataManager.geneprod.prevSaved() &&
                    this.state.dataManager.genereg.prevSaved()) {
                    this.props.setIsInteractionsSavedToDB();
                }

                // phenotypes
                this.props.setAllelePhenotype(this.state.dataManager.newmutant.isChecked(), this.state.dataManager.newmutant.details());
                this.props.setRnaiPhenotype(this.state.dataManager.rnai.isChecked(), this.state.dataManager.rnai.details());
                this.props.setOverexprPhenotype(this.state.dataManager.overexpr.isChecked(), this.state.dataManager.overexpr.details());
                this.props.setChemicalPhenotype(this.state.dataManager.chemphen.isChecked(), this.state.dataManager.chemphen.details());
                this.props.setEnvironmentalPhenotype(this.state.dataManager.envpheno.isChecked(), this.state.dataManager.envpheno.details());
                this.props.setEnzymaticActivity(this.state.dataManager.catalyticact.isChecked(), this.state.dataManager.catalyticact.details());
                if (this.state.dataManager.newmutant.prevSaved() && this.state.dataManager.rnai.prevSaved() &&
                    this.state.dataManager.overexpr.prevSaved() && this.state.dataManager.chemphen.prevSaved() &&
                    this.state.dataManager.envpheno.prevSaved() && this.state.dataManager.catalyticact.prevSaved()) {
                    this.props.setIsPhenotypesSavedToDB();
                }

                // disease
                this.props.setDisease(this.state.dataManager.disease.isChecked(), this.state.dataManager.disease.details());
                if (this.state.dataManager.disease.prevSaved()) {
                    this.props.setIsDiseaseSavedToDB();
                }

                // comments
                this.props.setComments(this.state.dataManager.comments.details());
                if (this.state.dataManager.comments.prevSaved()) {
                    this.props.setIsCommentsSavedToDB();
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({show_fetch_data_error: true})
            });

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
                    <Header/>
                    <Title title={title} journal={parameters.journal} pmid={parameters.pmid} doi={parameters.doi}/><br/>
                    <div>
                        <div>
                            <div className="col-sm-4">
                                <div className="panel panel-default">
                                    <div className="panel-body">
                                        <Nav bsStyle="pills" stacked onSelect={this.handleSelectMenu}>
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
                                            active={this.state.isLoading}
                                            spinner
                                            text='Sending data ...'
                                        >
                                            <Route exact path="/" render={() => (
                                                <Redirect to={"/overview" + this.props.location.search}/>)}/>
                                            <Route path={"/" + WIDGET.OVERVIEW}
                                                   render={() => <Overview callback={this.handleFinishedSection}
                                                                           hideGenes={this.state.hideGenes}
                                                                           toggleEntityVisibilityCallback={this.enableEntityListVisibility}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.GENETICS}
                                                   render={() => <Genetics callback={this.handleFinishedSection}
                                                                           hideAlleles={this.state.hideAlleles}
                                                                           hideStrains={this.state.hideStrains}
                                                                           toggleEntityVisibilityCallback={this.enableEntityListVisibility}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.REAGENT}
                                                   render={() => <Reagent callback={this.handleFinishedSection}/>}
                                            />
                                            <Route path={"/" + WIDGET.EXPRESSION}
                                                   render={() => <Expression callback={this.handleFinishedSection}/>}
                                            />
                                            <Route path={"/" + WIDGET.INTERACTIONS}
                                                   render={() => <Interactions
                                                       callback={this.handleFinishedSection}
                                                   />}
                                            />
                                            <Route path={"/" + WIDGET.PHENOTYPES}
                                                   render={() => <Phenotypes callback={this.handleFinishedSection}/>}/>
                                            <Route path={"/" + WIDGET.DISEASE}
                                                   render={() => <Disease callback={this.handleFinishedSection}/>}/>
                                            <Route path={"/" + WIDGET.COMMENTS} render={() => <ContactInfo
                                                callback={this.handleFinishedSection}
                                                personId={this.state.personid}
                                            />}/>
                                        </LoadingOverlay>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <WelcomeModal show={this.state.showPopup} onHide={this.handleClosePopup}/>
                    <DataSavedModal show={this.state.show_data_saved} onHide={this.goToNextSection}
                                    success={this.state.data_saved_success}
                                    last_widget={this.state.data_saved_last_widget}/>
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
    isGeneticsSavedToDB: isGeneticsSavedToDB(state),
    isReagentSavedToDB: isReagentSavedToDB(state),
    isExpressionSavedToDB: isExpressionSavedToDB(state),
    isInteractionsSavedToDB: isInteractionsSavedToDB(state),
    isPhenotypesSavedToDB: isPhenotypesSavedToDB(state),
    isDiseaseSavedToDB: isDiseaseSavedToDB(state),
    isCommentsSavedToDB: isCommentsSavedToDB(state)
});

export default connect(mapStateToProps, {
    setGenes, setSpecies, setGeneModel, setPerson, setIsOverviewSavedToDB,
    setAlleles, setStrains, setSequenceChange, setOtherAlleles, setOtherStrains, setIsGeneticsSavedToDB, setTransgenes,
    setOtherTransgenes, setOtherAntibodies, setNewAntibodies, setIsReagentSavedToDB, setExpression, setSiteOfAction,
    setTimeOfAction, setRnaseq, setAdditionalExpr, setIsExpressionSavedToDB, setGeneticInteractions,
    setPhysicalInteractions, setRegulatoryInteractions, setIsInteractionsSavedToDB, setAllelePhenotype,
    toggleAllelePhenotype, setRnaiPhenotype, setOverexprPhenotype, setChemicalPhenotype, setEnvironmentalPhenotype,
    setEnzymaticActivity, setIsPhenotypesSavedToDB, setDisease, setIsDiseaseSavedToDB, setComments, setIsCommentsSavedToDB
})(withRouter(MenuAndWidgets));