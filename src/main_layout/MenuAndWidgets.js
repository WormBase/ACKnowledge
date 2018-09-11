import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import Overview from "../pages/Overview";
import Expression from "../pages/Expression";
import {Alert, Button, Modal, Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Other from "../pages/Other";
import Reagent from "../pages/Reagent";
import Phenotypes from "../pages/Phenotypes";
import Interactions from "../pages/Interactions";
import Genetics from "../pages/Genetics";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import ContactInfo from "../pages/ContactInfo";
import queryString from 'query-string';
import Title from "./Title";
import Disease from "../pages/Disease";

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
            case "/other":
                currSelectedMenu = 8;
                break;
            case "/contact_info":
                currSelectedMenu = 9;
                break;
            default:
                currSelectedMenu = 1;
        }
        let parameters = queryString.parse(this.props.location.search);
        this.state = {
            pages: ["overview", "genetics", "reagent", "expression", "interactions", "phenotypes", "disease", "other",
                "contact_info"],
            selectedMenu: currSelectedMenu,
            completedSections: {"overview": false, "expression": false, "genetics": false, "interactions": false,
                "phenotypes": false, "reagent": false, "disease": false, "other": false, "contact_info": false},
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
            orthologsDis: false,
            transgenicDis: false,
            modifiersDis: false,
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
            let selectedGenes = new Set();
            if (data.genestudied.afp !== undefined && data.genestudied.afp !== "" && data.genestudied.afp !== null) {
                selectedGenes = MenuAndWidgets.split_tfp_entities(data.genestudied.afp, "WBGene");
            } else if (data.genestudied.tfp !== undefined && data.genestudied.tfp !== "") {
                selectedGenes = MenuAndWidgets.split_tfp_entities(data.genestudied.tfp, "WBGene");
            }
            let genemodCorrection = false;
            let genemodCorrectionDetails = "";
            if (data.genemodcorr.afp !== undefined && data.genemodcorr.afp !== null && data.genemodcorr.afp !== "no") {
                genemodCorrection = true;
                genemodCorrectionDetails = data.genemodcorr.afp;
            }
            let selectedSpecies = new Set();
            if (data.species.afp !== undefined && data.species.afp !== "" && data.species.afp !== null) {
                selectedSpecies = MenuAndWidgets.split_tfp_entities(data.species.afp, "Taxon ID ");
            } else if (data.species.tfp !== undefined && data.species.tfp !== "") {
                selectedSpecies = MenuAndWidgets.split_tfp_entities(data.species.tfp, "Taxon ID ");
            }
            if (this.overview !== undefined) {
                this.overview.setSelectedGenes(selectedGenes);
                this.overview.setSelecedSpecies(selectedSpecies);
                this.overview.selfStateVarModifiedFunction(genemodCorrection, "cb_gmcorr");
                this.overview.selfStateVarModifiedFunction(genemodCorrectionDetails, "cb_gmcorr_details");
            }
            let selectedAlleles = new Set();
            if (data.variation.afp !== undefined && data.variation.afp !== "" && data.variation.afp !== null) {
                selectedAlleles = MenuAndWidgets.split_tfp_entities(data.variation.afp, "");
            } else if (data.variation.tfp !== undefined && data.variation.tfp !== "") {
                selectedAlleles = MenuAndWidgets.split_tfp_entities(data.variation.tfp, "");
            }
            let alleleSeqChange = false;
            if (data.alleleseqchange.afp !== undefined && data.alleleseqchange.afp !== null &&
                data.alleleseqchange.afp !== "no") {
                alleleSeqChange = true;
            } else if (data.seqchange.svm !== undefined && (data.seqchange.svm === "high" ||
                data.seqchange.svm === "medium")) {
                alleleSeqChange = true;
            }
            let selectedStrains = new Set();
            if (data.strain.afp !== undefined && data.strain.afp !== "" && data.strain.afp !== null) {
                selectedStrains = data.strain.afp.split(" | ").map((value) => value + " ( " + value + " )");
            } else if (data.strain.tfp !== undefined && data.strain.tfp !== "") {
                selectedStrains = data.strain.tfp.split(" | ").map((value) => value + " ( " + value + " )");
            }
            let otherAlleles = [ { id: 1, name: "" } ];
            if (data.otheralleles.afp !== undefined && data.otheralleles.afp !== null &&
                data.otheralleles.afp !== "") {
                otherAlleles = data.otheralleles.afp;
            }
            let otherStrains = [ { id: 1, name: "" } ];
            if (data.otherstrains.afp !== undefined && data.otherstrains.afp !== null &&
                data.otherstrains.afp !== "") {
                otherStrains = data.otherstrains.afp;
            }
            if (this.genetics !== undefined) {
                this.genetics.setSelectedAlleles(selectedAlleles);
                this.genetics.setSelecedStrains(selectedStrains);
                this.genetics.selfStateVarModifiedFunction(alleleSeqChange, "cb_allele");
                this.genetics.selfStateVarModifiedFunction(otherAlleles, "otherAlleles");
                this.genetics.selfStateVarModifiedFunction(otherStrains, "otherStrains");
            }
            let selectedTransgenes = new Set();
            if (data.transgene.afp !== undefined && data.transgene.afp !== "" && data.transgene.afp !== null) {
                selectedTransgenes = MenuAndWidgets.split_tfp_entities(data.transgene.afp, "");
            } else if (data.transgene.tfp !== undefined && data.transgene.tfp !== "") {
                selectedTransgenes = MenuAndWidgets.split_tfp_entities(data.transgene.tfp, "");
            }
            let newAntib = false;
            let newAntibDetails = "";
            if (data.antibody.afp !== undefined && data.antibody.afp !== "" && data.antibody.afp !== null) {
                newAntib = true;
                newAntibDetails = data.antibody.afp;
            }
            let otherTransgenes = [ { id: 1, name: "" } ];
            if (data.othertransgenes.afp !== undefined && data.othertransgenes.afp !== null &&
                data.othertransgenes.afp !== "") {
                otherTransgenes = data.othertransgenes.afp;
            }
            let otherAntibodies = [ { id: 1, name: "", publicationId: "" } ];
            if (data.otherantibodies.afp !== undefined && data.otherantibodies.afp !== null &&
                data.otherantibodies.afp !== "") {
                otherAntibodies = data.otherantibodies.afp;
            }
            if (this.reagent !== undefined) {
                this.reagent.setSelectedTransgenes(selectedTransgenes);
                this.reagent.selfStateVarModifiedFunction(newAntib, "cb_newantib");
                this.reagent.selfStateVarModifiedFunction(newAntibDetails, "cb_newantib_details");
                this.reagent.selfStateVarModifiedFunction(otherAntibodies, "other_antib");
                this.reagent.selfStateVarModifiedFunction(otherTransgenes, "otherTransgenes");
            }
            let anatomicExpr = false;
            let anatomicExprDetails = "";
            if (data.anatomicexpr.afp !== undefined && data.anatomicexpr.afp !== null && data.anatomicexpr.afp !==
                "no") {
                anatomicExpr = true;
                anatomicExprDetails = data.anatomicexpr.afp;
            } else if (data.otherexpr.svm !== undefined && (data.otherexpr.svm === "high" ||
                data.otherexpr.svm === "medium")) {
                anatomicExpr = true;
            }
            let siteAction = false;
            let siteActionDetails = "";
            if (data.siteaction.afp !== undefined && data.siteaction.afp !== null && data.siteaction.afp !== "no") {
                siteAction = true;
                siteActionDetails = data.siteaction.afp;
            }
            let timeAction = false;
            let timeActionDetails = "";
            if (data.timeaction.afp !== undefined && data.timeaction.afp !== null && data.timeaction.afp !== "no") {
                timeAction = true;
                timeActionDetails = data.timeaction.afp;
            }
            let rnaSeq = false;
            let rnaSeqDetails = "";
            if (data.rnaseq.afp !== undefined && data.rnaseq.afp !== null && data.rnaseq.afp !== "no") {
                rnaSeq = true;
                rnaSeqDetails = data.rnaseq.afp;
            }
            let additionalExpr = "";
            if (data.additionalexpr.afp !== undefined && data.additionalexpr.afp !== null && data.additionalexpr.afp !== "") {
                additionalExpr = data.additionalexpr.afp;
            }
            if (this.expression !== undefined) {
                this.expression.selfStateVarModifiedFunction(anatomicExpr, "cb_anatomic");
                this.expression.selfStateVarModifiedFunction(anatomicExprDetails, "cb_anatomic_details");
                this.expression.selfStateVarModifiedFunction(siteAction, "cb_site");
                this.expression.selfStateVarModifiedFunction(siteActionDetails, "cb_site_details");
                this.expression.selfStateVarModifiedFunction(timeAction, "cb_time");
                this.expression.selfStateVarModifiedFunction(timeActionDetails, "cb_time_details");
                this.expression.selfStateVarModifiedFunction(rnaSeq, "cb_rna");
                this.expression.selfStateVarModifiedFunction(rnaSeqDetails, "cb_rna_details");
                this.expression.selfStateVarModifiedFunction(additionalExpr, "additionalExpr");
            }
            let svmGeneInt = false;
            let svmGeneIntDetails = "";
            if (data.geneint.afp !== undefined && data.geneint.afp !== "" && data.geneint.afp !== null) {
                svmGeneInt = true;
                svmGeneIntDetails = data.geneint.afp;
            } else if (data.geneint.svm !== undefined && (data.geneint.svm === "high" ||
                data.geneint.svm === "medium")) {
                svmGeneInt = true;
            }
            let svmPhysInt = false;
            let svmPhysIntDetails = "";
            if (data.geneprod.afp !== undefined && data.geneprod.afp !== "" && data.geneprod.afp !== null) {
                svmPhysInt = true;
                svmPhysIntDetails = data.geneprod.afp;
            } else if (data.geneprod.svm !== undefined && (data.geneprod.svm === "high" ||
                data.geneprod.svm === "medium")) {
                svmPhysInt = true;
            }
            let svmGeneReg = false;
            let svmGeneRegDetails = "";
            if (data.genereg.afp !== undefined && data.genereg.afp !== "" && data.genereg.afp !== null) {
                svmGeneReg = true;
                svmGeneRegDetails = data.genereg.afp;
            } else if (data.genereg.svm !== undefined && (data.genereg.svm === "high" ||
                data.genereg.svm === "medium")) {
                svmGeneReg = true;
            }
            if (this.interactions !== undefined) {
                if (svmGeneInt === true) {
                    this.interactions.check_cb("cb_genetic", "svmGeneInt");
                    this.interactions.selfStateVarModifiedFunction(svmGeneIntDetails, "cb_genetic_details");
                }
                if (svmPhysInt === true) {
                    this.interactions.check_cb("cb_physical", "scmPhysInt");
                    this.interactions.selfStateVarModifiedFunction(svmPhysIntDetails, "cb_physical_details");
                }
                if (svmGeneReg === true) {
                    this.interactions.check_cb("cb_regulatory", "svmGeneReg");
                    this.interactions.selfStateVarModifiedFunction(svmGeneRegDetails, "cb_regulatory_details");
                }
            }
            let svmAllele = false;
            if (data.newmutant.afp !== undefined && data.newmutant.afp !== "" && data.newmutant.afp !== null) {
                svmAllele = true;
            } else if (data.newmutant.svm !== undefined && (data.newmutant.svm === "high" ||
                data.newmutant.svm === "medium")) {
                svmAllele = true;
            }
            let svmRNAi = false;
            if (data.rnai.afp !== undefined && data.rnai.afp !== "" && data.rnai.afp !== null) {
                svmRNAi = true;
            } else if (data.rnai.svm !== undefined && (data.rnai.svm === "high" || data.rnai.svm === "medium")) {
                svmRNAi = true;
            }
            let svmTransgene = false;
            if (data.overexpr.afp !== undefined && data.overexpr.afp !== "" && data.overexpr.afp !== null) {
                svmTransgene = true;
            } else if (data.overexpr.svm !== undefined && (data.overexpr.svm === "high" ||
                data.overexpr.svm === "medium")) {
                svmTransgene = true;
            }
            let svmProtein = false;
            let svmProteinDetails = "";
            if (data.catalyticact !== undefined && data.catalyticact.afp !== undefined && data.catalyticact.afp !== "" && data.catalyticact.afp !== null) {
                svmProtein = true;
                svmProteinDetails = data.catalyticact.afp;
            }
            let chemical = false;
            if (data.chemphen.afp !== undefined && data.chemphen.afp !== "" && data.chemphen.afp !== null) {
                chemical = true;
            }
            let env = false;
            if (data.envpheno.afp !== undefined && data.envpheno.afp !== "" && data.envpheno.afp !== null) {
                env = true;
            }
            if (this.phenotype !== undefined) {
                if (svmAllele === true) {
                    this.phenotype.check_cb("cb_allele", "svmAllele");
                }
                if (svmRNAi === true) {
                    this.phenotype.check_cb("cb_rnai", "svmRNAi");
                }
                if (svmTransgene === true) {
                    this.phenotype.check_cb("cb_transgene", "svmTransgene");
                }
                if (svmProtein === true) {
                    this.phenotype.check_cb("cb_protein", "svmProtein");
                    this.phenotype.selfStateVarModifiedFunction(svmProteinDetails, "cb_protein_details");
                }
                if (chemical === true) {
                    this.phenotype.check_cb("cb_chemical", "chemical");
                }
                if (env === true) {
                    this.phenotype.check_cb("cb_env", "env");
                }
            }
            let other = "";
            if (data.comment.afp !== undefined && data.comment.afp !== "" && data.comment.afp !== null) {
                other = data.comment.afp;
            }
            if (this.other !== undefined) {
                this.other.selfStateVarModifiedFunction(other, "other");
            }
            this.setState({
                selectedGenes: selectedGenes,
                selectedSpecies: selectedSpecies,
                geneModCorrection: genemodCorrection,
                geneModCorrectionDetails: genemodCorrectionDetails,
                selectedAlleles: selectedAlleles,
                alleleSeqChange: alleleSeqChange,
                selectedStrains: selectedStrains,
                selectedTransgenes: selectedTransgenes,
                newAntib: newAntib,
                otherAntibs: otherAntibodies,
                otherAlleles: otherAlleles,
                otherStrains: otherStrains,
                otherTransgenes: otherTransgenes,
                anatomicExpr: anatomicExpr,
                anatomicExprDetails: anatomicExprDetails,
                siteAction: siteAction,
                siteActionDetails: siteActionDetails,
                timeAction: timeAction,
                timeActionDetails: timeActionDetails,
                rnaSeq: rnaSeq,
                rnaSeqDetails: rnaSeqDetails,
                additionalExpr: additionalExpr,
                svmGeneInt: svmGeneInt,
                svmGeneIntDetails: svmGeneIntDetails,
                svmPhysInt: svmPhysInt,
                svmPhysIntDetails: svmPhysIntDetails,
                svmGeneReg: svmGeneReg,
                svmGeneRegDetails: svmGeneRegDetails,
                svmAllele: svmAllele,
                svmRNAi: svmRNAi,
                svmTransgene: svmTransgene,
                svmProtein: svmProtein,
                svmProteinDetails: svmProteinDetails,
                chemical: chemical,
                env: env,
                other: other
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
        let otherOk = false;
        if (this.state.completedSections["other"]) {
            otherOk = <Glyphicon glyph="ok"/>;
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
        return (
            <div>
                {data_fetch_err_alert}
                <Title title={"\"" + parameters.title + "\"; " + parameters.journal}/><br/>
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
                                        <IndexLinkContainer to={"other" + this.props.location.search} active={this.state.selectedMenu === 8}>
                                            <NavItem eventKey={8}>Anything else?&nbsp;{otherOk}</NavItem></IndexLinkContainer>
                                        <IndexLinkContainer to={"contact_info" + this.props.location.search} active={this.state.selectedMenu === 9}>
                                            <NavItem eventKey={9}>Update contact info&nbsp;{contact_infoOk}</NavItem>
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
                                                                  orthologs={this.state.orthologsDis}
                                                                  transgenic={this.state.transgenicDis}
                                                                  modifiers={this.state.modifiersDis}
                                                                  comments={this.state.disComments}
                                                                  stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                  toggleCb={this.toggle_cb}
                                           />}
                                    />
                                    <Route path="/other"
                                           render={() => <Other
                                               callback={this.handleFinishedSection}
                                               saved={this.state.completedSections["other"]}
                                               other={this.state.other}
                                               stateVarModifiedCallback={this.stateVarModifiedCallback}
                                           />}
                                    />
                                    <Route path="/contact_info" render={() => <ContactInfo
                                        callback={this.handleFinishedSection}
                                        saved={this.state.completedSections["contact_info"]}/>}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <MyLargeModal show={this.state.showPopup} onHide={this.handleClosePopup} />
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