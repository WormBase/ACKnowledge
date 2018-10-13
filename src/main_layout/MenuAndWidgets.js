import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import Overview from "../pages/Overview";
import Expression from "../pages/Expression";
import {Alert, Button, Modal, Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Reagent from "../pages/Reagent";
import Phenotypes from "../pages/Phenotypes";
import Interactions from "../pages/Interactions";
import Genetics from "../pages/Genetics";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import ContactInfo from "../pages/ContactInfo";
import queryString from 'query-string';
import Title from "./Title";
import Disease from "../pages/Disease";
import Header from "./Header";

class MenuAndWidgets extends React.Component {
    constructor(props) {
        super(props);
        let currSelectedMenu = 1;
        const currentLocation = props.location.pathname;
        switch (currentLocation) {
            case "/overview":
                currSelectedMenu = 1;
                break;
            case "/expression":
                currSelectedMenu = 4;
                break;
            case "/genetics":
                currSelectedMenu = 2;
                break;
            case "/interactions":
                currSelectedMenu = 5;
                break;
            case "/phenotypes":
                currSelectedMenu = 6;
                break;
            case "/reagent":
                currSelectedMenu = 3;
                break;
            case "/disease":
                currSelectedMenu = 7;
                break;
            case "/contact_info":
                currSelectedMenu = 9;
                break;
            default:
                currSelectedMenu = 1;
        }
        let parameters = queryString.parse(this.props.location.search);
        this.state = {
            pages: ["overview", "genetics", "reagent", "expression", "interactions", "phenotypes", "disease",
                "contact_info"],
            selectedMenu: currSelectedMenu,
            completedSections: {"overview": false, "expression": false, "genetics": false, "interactions": false,
                "phenotypes": false, "reagent": false, "disease": false, "contact_info": false},
            showPopup: true,
            paper_id: parameters.paper,
            passwd: parameters.passwd,
            show_fetch_data_error: false,
            selecedGenes: new Set(),
            geneModCorrection: false,
            geneModCorrectionDetails: "",
            selectedSpecies: new Set(),
            selectedAlleles: new Set(),
            alleleSeqChange: false,
            selectedStrains: new Set(),
            selectedTransgenes: new Set(),
            newAntib: false,
            otherAntibs: [ { id: 1, name: "", publicationId: "" } ],
            otherAlleles: [ { id: 1, name: "" } ],
            otherStrains: [ { id: 1, name: "" } ],
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
            svmAlleleDetails: "",
            svmTransgene: false,
            svmTransgeneDetails: "",
            svmRNAi: false,
            svmRNAiDetails: "",
            svmProtein: false,
            svmProteinDetails: "",
            chemical:false,
            env: false,
            other: "",
            humDis: false,
            disComments: ""
        };
        this.handleSelectMenu = this.handleSelectMenu.bind(this);
        this.handleFinishedSection = this.handleFinishedSection.bind(this);
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.stateVarModifiedCallback = this.stateVarModifiedCallback.bind(this);
    }

    static split_tfp_entities(entities_string, prefix) {
        let entities_split = entities_string.split(" | ");
        let final_entities_list = Array();
        for (let i in entities_split) {
            let entity_split = entities_split[i].split(";%;");
            final_entities_list.push(entity_split[1] + " ( " + prefix + entity_split[0] + " )");
        }
        return final_entities_list;
    }

    static getSetOfEntitiesForDatatype(afpDatatype, tfpDatatype, entityPrefix) {
        if (afpDatatype !== undefined && afpDatatype.afp !== undefined && afpDatatype.afp !== null) {
            if (afpDatatype.afp !== "") {
                if (entityPrefix !== null) {
                    return [MenuAndWidgets.split_tfp_entities(afpDatatype.afp, entityPrefix), true];
                } else {
                    return [afpDatatype.afp.split(" | "), true];
                }
            } else {
                return [new Set(), true];
            }
        } else if (tfpDatatype !== undefined && tfpDatatype.tfp !== undefined && tfpDatatype.tfp !== "" &&
            tfpDatatype.tfp !== null) {
            if (entityPrefix !== null) {
                return [MenuAndWidgets.split_tfp_entities(tfpDatatype.tfp, entityPrefix), false];
            } else {
                return [tfpDatatype.tfp.split(" | "), false];
            }
        } else {
            return [new Set(), false]
        }
    }

    static getCheckboxValueForDatatype(afpDatatype, svmDatatype) {
        if (afpDatatype !== undefined && afpDatatype.afp !== undefined && afpDatatype.afp !== null) {
            if (afpDatatype.afp !== "") {
                return [true, afpDatatype.afp, true]
            } else {
                return [false, "", true]
            }
        } else if (svmDatatype !== undefined && svmDatatype !== null && svmDatatype.svm !== null &&
            svmDatatype.svm !== undefined && (svmDatatype.svm === "high" || svmDatatype.svm === "medium")) {
            return [true, "", false]
        } else {
            return [false, "", false]
        }
    }

    static getTableValuesForDataType(afpDatatype, multicolumn) {
        let emptyVal = [ { id: 1, name: "" } ];
        if (multicolumn) {
            emptyVal = [ { id: 1, name: "", publicationId: "" } ];
        }
        if (afpDatatype !== undefined && afpDatatype.afp !== null) {
            if (afpDatatype.afp !== "") {
                return [JSON.parse(afpDatatype.afp), true];
            } else {
                return [emptyVal, true];
            }
        } else {
            return [emptyVal, false];
        }
    }

    componentDidMount() {
        fetch('http://mangolassi.caltech.edu/~azurebrd/cgi-bin/forms/textpresso/first_pass_api.cgi?action=jsonPaper&paper=' +
            this.state.paper_id + '&passwd=' + this.state.passwd)
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                } else {
                    this.setState({show_fetch_data_error: true})
                }
            }).then(data => {
            if (data === undefined) {
                this.setState({show_fetch_data_error: true})
            }
            let genes_stored = MenuAndWidgets.getSetOfEntitiesForDatatype(data.genestudied, data.genestudied, "WBGene");
            let genemod_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.structcorr, null);
            let species_stored = MenuAndWidgets.getSetOfEntitiesForDatatype(data.species, data.species, "Taxon ID ");
            let overviewAlreadySaved = genes_stored[1] && genemod_details_stored[2] && species_stored[1];
            if (this.overview !== undefined) {
                this.overview.setSelectedGenes(genes_stored[0]);
                this.overview.setSelecedSpecies(species_stored[0]);
                this.overview.selfStateVarModifiedFunction(genemod_details_stored[0], "cb_gmcorr");
                this.overview.selfStateVarModifiedFunction(genemod_details_stored[1], "cb_gmcorr_details");
                this.overview.selfStateVarModifiedFunction(overviewAlreadySaved, "saved");
                if (overviewAlreadySaved) {
                    this.overview.setSuccessAlertMessage();
                }
            }
            let variation_stored = MenuAndWidgets.getSetOfEntitiesForDatatype(data.variation, data.variation, "");
            let alleleseqchanged_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.alleleseqchange,
                data.seqchange);
            let strain_stored = MenuAndWidgets.getSetOfEntitiesForDatatype(data.strain, data.strain, null);
            let otheralleles_store = MenuAndWidgets.getTableValuesForDataType(data.othervariation, false);
            let otherstrain_store = MenuAndWidgets.getTableValuesForDataType(data.otherstrain, data.otherstrain, false);
            let geneticsAlreadySaved = variation_stored[1] && alleleseqchanged_details_stored[2] && strain_stored[1] &&
                otheralleles_store[1] && otherstrain_store[1];
            if (this.genetics !== undefined) {
                this.genetics.setSelectedAlleles(variation_stored[0]);
                this.genetics.setSelecedStrains(strain_stored[0]);
                this.genetics.selfStateVarModifiedFunction(alleleseqchanged_details_stored[0], "cb_allele");
                this.genetics.setOtherAlleles(otheralleles_store[0]);
                this.genetics.setOtherStrains(otherstrain_store[0]);
                if (geneticsAlreadySaved) {
                    this.genetics.setSuccessAlertMessage();
                }
            }
            let transgene_stored = MenuAndWidgets.getSetOfEntitiesForDatatype(data.transgene, data.transgene, "");
            let newantib_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.antibody, null);
            let othertransgene_store = MenuAndWidgets.getTableValuesForDataType(data.othertransgene, false);
            let otherantibody_store = MenuAndWidgets.getTableValuesForDataType(data.othertransgene, true);

            let reagentAlreadySaved = transgene_stored[1] && newantib_details_stored[2] && othertransgene_store [1] &&
                otherantibody_store[1];
            if (this.reagent !== undefined) {
                this.reagent.setSelectedTransgenes(transgene_stored[0]);
                this.reagent.selfStateVarModifiedFunction(newantib_details_stored[0], "cb_newantib");
                this.reagent.selfStateVarModifiedFunction(newantib_details_stored[1], "cb_newantib_details");
                this.reagent.setOtherAntibodies(otherantibody_store[0]);
                this.reagent.setOtherTransgenes(othertransgene_store[0]);
                if (reagentAlreadySaved) {
                    this.reagent.setSuccessAlertMessage();
                }
            }
            let anatomicexpr_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.otherexpr, data.otherexpr);
            let siteaction_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.siteaction, null);
            let timeaction_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.timeaction, null);
            let rnaseq_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.rnaseq, null);
            let additionalexpr_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.additionalexpr, null);
            let expressionAlreadySaved = anatomicexpr_details_stored[2] && siteaction_details_stored[2] &&
                timeaction_details_stored[2] && rnaseq_details_stored[2] && additionalexpr_details_stored[2];
            if (this.expression !== undefined) {
                this.expression.selfStateVarModifiedFunction(anatomicexpr_details_stored[0], "cb_anatomic");
                this.expression.selfStateVarModifiedFunction(anatomicexpr_details_stored[1], "cb_anatomic_details");
                this.expression.selfStateVarModifiedFunction(siteaction_details_stored[0], "cb_site");
                this.expression.selfStateVarModifiedFunction(siteaction_details_stored[1], "cb_site_details");
                this.expression.selfStateVarModifiedFunction(timeaction_details_stored[0], "cb_time");
                this.expression.selfStateVarModifiedFunction(timeaction_details_stored[1], "cb_time_details");
                this.expression.selfStateVarModifiedFunction(rnaseq_details_stored[0], "cb_rna");
                this.expression.selfStateVarModifiedFunction(rnaseq_details_stored[1], "cb_rna_details");
                this.expression.selfStateVarModifiedFunction(additionalexpr_details_stored[1], "additionalExpr");
                if (expressionAlreadySaved) {
                    this.expression.setSuccessAlertMessage();
                }
            }
            let geneint_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.geneint, data.geneint);
            let physint_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.geneprod, data.geneprod);
            let genereg_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.genereg, data.genereg);
            let interactionsAlreadySaved = geneint_details_stored[2] && physint_details_stored[2] &&
                genereg_details_stored[2];
            if (this.interactions !== undefined) {
                this.interactions.selfStateVarModifiedFunction(geneint_details_stored[0], "cb_genetic");
                this.interactions.selfStateVarModifiedFunction(geneint_details_stored[1], "cb_genetic_details");
                this.interactions.selfStateVarModifiedFunction(physint_details_stored[0], "cb_physical");
                this.interactions.selfStateVarModifiedFunction(physint_details_stored[1], "cb_physical_details");
                this.interactions.selfStateVarModifiedFunction(genereg_details_stored[0], "cb_regulatory");
                this.interactions.selfStateVarModifiedFunction(genereg_details_stored[1], "cb_regulatory_details");
                if (interactionsAlreadySaved) {
                    this.interactions.setSuccessAlertMessage();
                }
            }
            let allele_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.newmutant, data.newmutant);
            let rnai_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.rnai, data.rnai);
            let transgene_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.overexpr, data.overexpr);
            let protein_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.invitro, null);
            let chemical_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.chemphen, null);
            let env_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.envpheno, null);
            let phenotypeAlreadySaved = allele_details_stored[2] && rnai_details_stored [2] &&
                transgene_details_stored[2] && protein_details_stored[2] && chemical_details_stored[2] &&
                env_details_stored[2];
            if (this.phenotype !== undefined) {
                this.phenotype.selfStateVarModifiedFunction(allele_details_stored[0], "cb_allele");
                this.phenotype.selfStateVarModifiedFunction(rnai_details_stored[0], "cb_rnai");
                this.phenotype.selfStateVarModifiedFunction(transgene_details_stored[0], "cb_transgene");
                this.phenotype.selfStateVarModifiedFunction(protein_details_stored[0], "cb_protein");
                this.phenotype.selfStateVarModifiedFunction(protein_details_stored[1], "cb_protein_details");
                this.phenotype.selfStateVarModifiedFunction(chemical_details_stored[0], "cb_chemical");
                this.phenotype.selfStateVarModifiedFunction(env_details_stored[0], "cb_env");
                if (phenotypeAlreadySaved) {
                    this.phenotype.setSuccessAlertMessage();
                }
            }
            let humdis_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.humdis, null);
            let diseaseAlreadySaved = humdis_details_stored[2];
            if (this.disease !== undefined) {
                this.disease.selfStateVarModifiedFunction(humdis_details_stored[0], "cb_humdis");
                this.disease.selfStateVarModifiedFunction(humdis_details_stored[1], "comments");
                if (diseaseAlreadySaved) {
                    this.disease.setSuccessAlertMessage();
                }
            }
            let comments_details_stored = MenuAndWidgets.getCheckboxValueForDatatype(data.comment, null);
            let otherAlreadySaved = comments_details_stored[2];
            if (this.other !== undefined) {
                this.other.selfStateVarModifiedFunction(comments_details_stored[1], "other");
                if (otherAlreadySaved) {
                    this.other.setSuccessAlertMessage();
                }
            }
            this.setState({
                selectedGenes: genes_stored[0], selectedSpecies: species_stored[0],
                geneModCorrection: genemod_details_stored[0], geneModCorrectionDetails: genemod_details_stored[1],
                selectedAlleles: variation_stored[0], alleleSeqChange: alleleseqchanged_details_stored[0],
                selectedStrains: strain_stored[0], selectedTransgenes: transgene_stored[0],
                newAntib: newantib_details_stored[0], otherAntibs: otherantibody_store[0],
                otherAlleles: otheralleles_store[0], otherStrains: otherstrain_store[0],
                otherTransgenes: othertransgene_store[0], anatomicExpr: anatomicexpr_details_stored[0],
                anatomicExprDetails: anatomicexpr_details_stored[1], siteAction: siteaction_details_stored[0],
                siteActionDetails: siteaction_details_stored[1], timeAction: timeaction_details_stored[0],
                timeActionDetails: timeaction_details_stored[1], rnaSeq: rnaseq_details_stored[0],
                rnaSeqDetails: rnaseq_details_stored[1], additionalExpr: additionalexpr_details_stored[1],
                svmGeneInt: geneint_details_stored[0], svmGeneIntDetails: geneint_details_stored[1],
                svmPhysInt: physint_details_stored[0], svmPhysIntDetails: physint_details_stored[1],
                svmGeneReg: genereg_details_stored[0], svmGeneRegDetails: genereg_details_stored[1],
                svmAllele: allele_details_stored[0], svmRNAi: rnai_details_stored[0],
                svmTransgene: transgene_details_stored[0], svmProtein: protein_details_stored[0],
                svmProteinDetails: protein_details_stored[1], chemical: chemical_details_stored[0],
                env: env_details_stored[0], other: comments_details_stored[1], humDis: humdis_details_stored[0],
                disComments: humdis_details_stored[1],
                completedSections: {"overview": overviewAlreadySaved, "expression": expressionAlreadySaved,
                    "genetics": geneticsAlreadySaved, "interactions": interactionsAlreadySaved,
                    "phenotypes": phenotypeAlreadySaved, "reagent": reagentAlreadySaved,
                    "disease": diseaseAlreadySaved, "contact_info": otherAlreadySaved},
            });
        }).catch(() => this.setState({show_fetch_data_error: true}));
    }

    handleSelectMenu(selected) {
        this.setState({
            selectedMenu: selected
        });
    }

    handleFinishedSection(section) {
        const newCompletedSections = this.state.completedSections;
        newCompletedSections[section] = true;
        const newSelectedMenu = Math.min(this.state.selectedMenu + 1, this.state.pages.length);
        this.setState({completedSections: newCompletedSections, selectedMenu: newSelectedMenu});
        this.props.history.push(this.state.pages[newSelectedMenu - 1]);
    }

    handleClosePopup() {
        this.setState({showPopup: false})
    }

    stateVarModifiedCallback(value, stateVarName) {
        let stateElem = {};
        stateElem[stateVarName] = value;
        this.setState(stateElem);
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
        let overviewOk = false;
        if (this.state.completedSections["overview"]) {
            overviewOk = <Glyphicon glyph="ok"/>;
        }
        let expressionOk = false;
        if (this.state.completedSections["expression"]) {
            expressionOk = <Glyphicon glyph="ok"/>;
        }
        let geneticsOk = false;
        if (this.state.completedSections["genetics"]) {
            geneticsOk = <Glyphicon glyph="ok"/>;
        }
        let interactionsOk = false;
        if (this.state.completedSections["interactions"]) {
            interactionsOk = <Glyphicon glyph="ok"/>;
        }
        let phenotypesOk = false;
        if (this.state.completedSections["phenotypes"]) {
            phenotypesOk = <Glyphicon glyph="ok"/>;
        }
        let reagentOk = false;
        if (this.state.completedSections["reagent"]) {
            reagentOk = <Glyphicon glyph="ok"/>;
        }
        let diseaseOk = false;
        if (this.state.completedSections["disease"]) {
            diseaseOk = <Glyphicon glyph="ok"/>;
        }
        let contact_infoOk = false;
        if (this.state.completedSections["contact_info"]) {
            contact_infoOk = <Glyphicon glyph="ok"/>;
        }
        let data_fetch_err_alert = false;
        if (this.state.show_fetch_data_error) {
            data_fetch_err_alert = <Alert bsStyle="danger">
                <Glyphicon glyph="warning-sign"/> <strong>Error</strong><br/>
                We are having problems retrieving your data from the server and some components may
                behave incorrectly. This could be caused by wrong credentials or by a network issue.
                Please try again later or contact <a href="mailto:help@wormbase.org">
                Wormbase Helpdesk</a>.
            </Alert>;
        }
        let parameters = queryString.parse(this.props.location.search);
        let title = parameters.title;
        if (title === undefined) {
            title = "";
        } else {
            title = "\"" + title + "\"";
        }
        return (
            <div className="container">
                <div className="row">
                {data_fetch_err_alert}
                <Header />
                <Title title={title} journal={parameters.journal} pmid={parameters.pmid}/><br/>
                <div>
                    <div>
                        <div className="col-sm-4">
                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <Nav bsStyle="pills" stacked onSelect={this.handleSelectMenu}>
                                        <IndexLinkContainer to={"overview" + this.props.location.search}
                                                            active={this.state.selectedMenu === 1}>
                                            <NavItem eventKey={1}>Overview (Genes and Species)
                                                &nbsp;{overviewOk}
                                            </NavItem></IndexLinkContainer>
                                        <IndexLinkContainer to={"genetics" + this.props.location.search}
                                                            active={this.state.selectedMenu === 2}>
                                            <NavItem eventKey={2}>Genetics&nbsp;{geneticsOk}</NavItem></IndexLinkContainer>
                                        <IndexLinkContainer to={"reagent" + this.props.location.search} active={this.state.selectedMenu === 3}>
                                            <NavItem eventKey={3}>Reagent&nbsp;{reagentOk}</NavItem></IndexLinkContainer>
                                        <IndexLinkContainer to={"expression" + this.props.location.search} active={this.state.selectedMenu === 4}>
                                            <NavItem eventKey={4}>Expression&nbsp;{expressionOk}</NavItem>
                                        </IndexLinkContainer>
                                        <IndexLinkContainer to={"interactions" + this.props.location.search} active={this.state.selectedMenu === 5}>
                                            <NavItem eventKey={5}>Interactions&nbsp;{interactionsOk}</NavItem>
                                        </IndexLinkContainer>
                                        <IndexLinkContainer to={"phenotypes" + this.props.location.search} active={this.state.selectedMenu === 6}>
                                            <NavItem eventKey={6}>Phenotypes and function&nbsp;{phenotypesOk}</NavItem>
                                        </IndexLinkContainer>
                                        <IndexLinkContainer to={"disease" + this.props.location.search} active={this.state.selectedMenu === 7}>
                                            <NavItem eventKey={7}>Disease&nbsp;{diseaseOk}</NavItem>
                                        </IndexLinkContainer>
                                        <IndexLinkContainer to={"contact_info" + this.props.location.search} active={this.state.selectedMenu === 9}>
                                            <NavItem eventKey={9}>Comments and submit&nbsp;{contact_infoOk}</NavItem>
                                        </IndexLinkContainer>
                                    </Nav>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-8">
                            <div className="panel panel-default">
                                <div className="panel-body">
                                    <Route exact path="/" render={() => (<Redirect to={"/overview" + this.props.location.search}/>)}/>
                                    <Route path="/overview"
                                           render={() => <Overview callback={this.handleFinishedSection}
                                                                   saved={this.state.completedSections["overview"]}
                                                                   ref={instance => { this.overview = instance; }}
                                                                   selectedGenes={this.state.selectedGenes}
                                                                   geneModCorr={this.state.geneModCorrection}
                                                                   geneModCorrDetails={this.state.geneModCorrectionDetails}
                                                                   selectedSpecies={this.state.selectedSpecies}
                                                                   stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                   toggleCb={this.toggle_cb}
                                                                   checkCb={this.check_cb}
                                           />}
                                    />
                                    <Route path="/genetics"
                                           render={() => <Genetics  callback={this.handleFinishedSection}
                                                                    saved={this.state.completedSections["genetics"]}
                                                                    ref={instance => { this.genetics = instance; }}
                                                                    selectedAlleles={this.state.selectedAlleles}
                                                                    selectedStrains={this.state.selectedStrains}
                                                                    stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                    alleleSeqChange={this.state.alleleSeqChange}
                                                                    otherAlleles={this.state.otherAlleles}
                                                                    otherStrains={this.state.otherStrains}
                                                                    toggleCb={this.toggle_cb}
                                                                    checkCb={this.check_cb}
                                           />}
                                    />
                                    <Route path="/reagent"
                                           render={() => <Reagent callback={this.handleFinishedSection}
                                                                  saved={this.state.completedSections["reagent"]}
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
                                    <Route path="/expression"
                                           render={() => <Expression callback={this.handleFinishedSection}
                                                                     saved={this.state.completedSections["expression"]}
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
                                    <Route path="/interactions"
                                           render={() => <Interactions
                                               callback={this.handleFinishedSection}
                                               saved={this.state.completedSections["interactions"]}
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
                                    <Route path="/phenotypes"
                                           render={() => <Phenotypes
                                               callback={this.handleFinishedSection}
                                               saved={this.state.completedSections["phenotypes"]}
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
                                    <Route path="/disease"
                                           render={() => <Disease callback={this.handleFinishedSection}
                                                                  saved={this.state.completedSections["disease"]}
                                                                  humDis={this.state.humDis}
                                                                  comments={this.state.disComments}
                                                                  stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                  toggleCb={this.toggle_cb}
                                                                  checkCb={this.check_cb}
                                                                  ref={instance => { this.disease = instance; }}
                                           />}
                                    />
                                    <Route path="/contact_info" render={() => <ContactInfo
                                        callback={this.handleFinishedSection}
                                        saved={this.state.completedSections["contact_info"]}
                                        other={this.state.other}
                                        stateVarModifiedCallback={this.stateVarModifiedCallback}
                                        ref={instance => { this.other = instance; }}
                                    />}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <MyLargeModal show={this.state.showPopup} onHide={this.handleClosePopup} />
            </div>
            </div>
        );
    }
}

class MyLargeModal extends React.Component {

    constructor(props, context) {
        super(props, context);

        let show = "";
        if (props["show"] !== undefined) {
            show = props["show"];
        }
        this.state = {
            show: show
        };
    }


    render() {
        if (this.state.show) {
            return (
                <Modal
                    {...this.props}
                    bsSize="large"
                    aria-labelledby="contained-modal-title-sm">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">Welcome</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Thank you for filling out this form. By doing so, you are helping us incorporate your data into WormBase in a timely fashion.
                        </p>
                        <p>
                            Please review the information presented in each page of the form. If needed, you may revise what is there or add more information.
                        </p>
                        <p>
                            To save the data entered in each page and move to the next, click 'Save and continue'. You can return to each page any time. When you are finished, please click on 'Finish and Submit' on the last page.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>Close</Button>
                    </Modal.Footer>
                </Modal>
            );
        } else {
            return ("");
        }
    }
}

export default withRouter(MenuAndWidgets);