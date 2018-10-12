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
            let overviewAlreadySaved = false;
            if (data.genestudied.afp !== undefined && data.genestudied.afp !== "" && data.genestudied.afp !== null) {
                selectedGenes = MenuAndWidgets.split_tfp_entities(data.genestudied.afp, "WBGene");
                overviewAlreadySaved = true;
            } else if (data.genestudied.tfp !== undefined && data.genestudied.tfp !== "" && data.genestudied.tfp !== null) {
                selectedGenes = MenuAndWidgets.split_tfp_entities(data.genestudied.tfp, "WBGene");
            }
            let genemodCorrection = false;
            let genemodCorrectionDetails = "";
            if (data.structcorr.afp !== undefined && data.structcorr.afp !== null && data.structcorr.afp !== "no") {
                genemodCorrection = true;
                genemodCorrectionDetails = data.structcorr.afp;
                overviewAlreadySaved = true;
            }
            let selectedSpecies = new Set();
            if (data.species.afp !== undefined && data.species.afp !== "" && data.species.afp !== null) {
                selectedSpecies = MenuAndWidgets.split_tfp_entities(data.species.afp, "Taxon ID ");
                overviewAlreadySaved = true;
            } else if (data.species.tfp !== undefined && data.species.tfp !== "" && data.species.tfp !== null) {
                selectedSpecies = MenuAndWidgets.split_tfp_entities(data.species.tfp, "Taxon ID ");
            }
            if (this.overview !== undefined) {
                this.overview.setSelectedGenes(selectedGenes);
                this.overview.setSelecedSpecies(selectedSpecies);
                this.overview.selfStateVarModifiedFunction(genemodCorrection, "cb_gmcorr");
                this.overview.selfStateVarModifiedFunction(genemodCorrectionDetails, "cb_gmcorr_details");
                this.overview.selfStateVarModifiedFunction(overviewAlreadySaved, "saved");
                if (overviewAlreadySaved) {
                    this.overview.setSuccessAlertMessage();
                }
            }
            let geneticsAlreadySaved = false;
            let selectedAlleles = new Set();
            if (data.variation.afp !== undefined && data.variation.afp !== "" && data.variation.afp !== null) {
                selectedAlleles = MenuAndWidgets.split_tfp_entities(data.variation.afp, "");
                geneticsAlreadySaved = true;
            } else if (data.variation.tfp !== undefined && data.variation.tfp !== "" && data.variation.tfp !== null) {
                selectedAlleles = MenuAndWidgets.split_tfp_entities(data.variation.tfp, "");
            }
            let alleleSeqChange = false;
            if (data.alleleseqchange.afp !== undefined && data.alleleseqchange.afp !== null &&
                data.alleleseqchange.afp !== "no") {
                alleleSeqChange = true;
                geneticsAlreadySaved = true;
            } else if (data.seqchange.svm !== undefined && (data.seqchange.svm === "high" ||
                data.seqchange.svm === "medium")) {
                alleleSeqChange = true;
            }
            let selectedStrains = new Set();
            if (data.strain.afp !== undefined && data.strain.afp !== "" && data.strain.afp !== null) {
                selectedStrains = data.strain.afp.split(" | ").map((value) => value + " ( " + value + " )");
                geneticsAlreadySaved = true;
            } else if (data.strain.tfp !== undefined && data.strain.tfp !== "" && data.strain.tfp !== null) {
                selectedStrains = data.strain.tfp.split(" | ").map((value) => value + " ( " + value + " )");
            }
            let otherAlleles = [ { id: 1, name: "" } ];
            if (data.othervariation.afp !== undefined && data.othervariation.afp !== null &&
                data.othervariation.afp !== "") {
                otherAlleles = JSON.parse(data.othervariation.afp);
                geneticsAlreadySaved = true;
            }
            let otherStrains = [ { id: 1, name: "" } ];
            if (data.otherstrain.afp !== undefined && data.otherstrain.afp !== null &&
                data.otherstrain.afp !== "") {
                otherStrains = JSON.parse(data.otherstrain.afp);
                geneticsAlreadySaved = true;
            }
            if (this.genetics !== undefined) {
                this.genetics.setSelectedAlleles(selectedAlleles);
                this.genetics.setSelecedStrains(selectedStrains);
                this.genetics.selfStateVarModifiedFunction(alleleSeqChange, "cb_allele");
                this.genetics.setOtherAlleles(otherAlleles);
                this.genetics.setOtherStrains(otherStrains);
                if (geneticsAlreadySaved) {
                    this.genetics.setSuccessAlertMessage();
                }
            }
            let reagentAlreadySaved = false;
            let selectedTransgenes = new Set();
            if (data.transgene.afp !== undefined && data.transgene.afp !== "" && data.transgene.afp !== null) {
                selectedTransgenes = MenuAndWidgets.split_tfp_entities(data.transgene.afp, "");
                reagentAlreadySaved = true;
            } else if (data.transgene.tfp !== undefined && data.transgene.tfp !== "" && data.transgene.tfp !== null) {
                selectedTransgenes = MenuAndWidgets.split_tfp_entities(data.transgene.tfp, "");
            }
            let newAntib = false;
            let newAntibDetails = "";
            if (data.antibody.afp !== undefined && data.antibody.afp !== "" && data.antibody.afp !== null) {
                newAntib = true;
                if (data.antibody.afp !== "yes") {
                    newAntibDetails = data.antibody.afp;
                }
                reagentAlreadySaved = true;
            }
            let otherTransgenes = [ { id: 1, name: "" } ];
            if (data.othertransgene.afp !== undefined && data.othertransgene.afp !== null &&
                data.othertransgene.afp !== "") {
                otherTransgenes = JSON.parse(data.othertransgene.afp);
                reagentAlreadySaved = true;
            }
            let otherAntibodies = [ { id: 1, name: "", publicationId: "" } ];
            if (data.otherantibody.afp !== undefined && data.otherantibody.afp !== null &&
                data.otherantibody.afp !== "") {
                otherAntibodies = JSON.parse(data.otherantibody.afp);
                reagentAlreadySaved = true;
            }
            if (this.reagent !== undefined) {
                this.reagent.setSelectedTransgenes(selectedTransgenes);
                this.reagent.selfStateVarModifiedFunction(newAntib, "cb_newantib");
                this.reagent.selfStateVarModifiedFunction(newAntibDetails, "cb_newantib_details");
                this.reagent.setOtherAntibodies(otherAntibodies);
                this.reagent.setOtherTransgenes(otherTransgenes);
                if (reagentAlreadySaved) {
                    this.reagent.setSuccessAlertMessage();
                }
            }
            let expressionAlreadySaved = false;
            let anatomicExpr = false;
            let anatomicExprDetails = "";
            if (data.otherexpr.afp !== undefined && data.otherexpr.afp !== null && data.otherexpr.afp !==
                "no") {
                anatomicExpr = true;
                expressionAlreadySaved = true;
                if (data.otherexpr.afp !== "yes") {
                    anatomicExprDetails = data.otherexpr.afp;
                }
            } else if (data.otherexpr.svm !== undefined && (data.otherexpr.svm === "high" ||
                data.otherexpr.svm === "medium")) {
                anatomicExpr = true;
            }
            let siteAction = false;
            let siteActionDetails = "";
            if (data.siteaction.afp !== undefined && data.siteaction.afp !== null && data.siteaction.afp !== "no") {
                siteAction = true;
                expressionAlreadySaved = true;
                if (data.siteaction.afp !== "yes") {
                    siteActionDetails = data.siteaction.afp;
                }
            }
            let timeAction = false;
            let timeActionDetails = "";
            if (data.timeaction.afp !== undefined && data.timeaction.afp !== null && data.timeaction.afp !== "no") {
                timeAction = true;
                expressionAlreadySaved = true;
                if (data.timeaction.afp !== "yes") {
                    timeActionDetails = data.timeaction.afp;
                }
            }
            let rnaSeq = false;
            let rnaSeqDetails = "";
            if (data.rnaseq.afp !== undefined && data.rnaseq.afp !== null && data.rnaseq.afp !== "no") {
                rnaSeq = true;
                expressionAlreadySaved = true;
                if (data.rnaseq.afp !== "yes") {
                    rnaSeqDetails = data.rnaseq.afp;
                }
            }
            let additionalExpr = "";
            if (data.additionalexpr.afp !== undefined && data.additionalexpr.afp !== null && data.additionalexpr.afp !== "") {
                additionalExpr = data.additionalexpr.afp;
                expressionAlreadySaved = true;
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
                if (expressionAlreadySaved) {
                    this.expression.setSuccessAlertMessage();
                }
            }
            let interactionsAlreadySaved = false;
            let svmGeneInt = false;
            let svmGeneIntDetails = "";
            if (data.geneint.afp !== undefined && data.geneint.afp !== "" && data.geneint.afp !== null) {
                svmGeneInt = true;
                interactionsAlreadySaved = true;
                if (data.geneint.afp !== "yes") {
                    svmGeneIntDetails = data.geneint.afp;
                }
            } else if (data.geneint.svm !== undefined && (data.geneint.svm === "high" ||
                data.geneint.svm === "medium")) {
                svmGeneInt = true;
            }
            let svmPhysInt = false;
            let svmPhysIntDetails = "";
            if (data.geneprod.afp !== undefined && data.geneprod.afp !== "" && data.geneprod.afp !== null) {
                svmPhysInt = true;
                interactionsAlreadySaved = true;
                if (data.geneprod.afp !== "yes") {
                    svmPhysIntDetails = data.geneprod.afp;
                }
            } else if (data.geneprod.svm !== undefined && (data.geneprod.svm === "high" ||
                data.geneprod.svm === "medium")) {
                svmPhysInt = true;
            }
            let svmGeneReg = false;
            let svmGeneRegDetails = "";
            if (data.genereg.afp !== undefined && data.genereg.afp !== "" && data.genereg.afp !== null) {
                svmGeneReg = true;
                interactionsAlreadySaved = true;
                if (data.genereg.afp !== "yes") {
                    svmGeneRegDetails = data.genereg.afp;
                }
            } else if (data.genereg.svm !== undefined && (data.genereg.svm === "high" ||
                data.genereg.svm === "medium")) {
                svmGeneReg = true;
            }
            if (this.interactions !== undefined) {
                this.interactions.selfStateVarModifiedFunction(svmGeneInt, "cb_genetic");
                this.interactions.selfStateVarModifiedFunction(svmGeneIntDetails, "cb_genetic_details");
                this.interactions.selfStateVarModifiedFunction(svmPhysInt, "cb_physical");
                this.interactions.selfStateVarModifiedFunction(svmPhysIntDetails, "cb_physical_details");
                this.interactions.selfStateVarModifiedFunction(svmGeneReg, "cb_regulatory");
                this.interactions.selfStateVarModifiedFunction(svmGeneRegDetails, "cb_regulatory_details");
                if (interactionsAlreadySaved) {
                    this.interactions.setSuccessAlertMessage();
                }
            }
            let phenotypeAlreadySaved = false;
            let svmAllele = false;
            if (data.newmutant.afp !== undefined && data.newmutant.afp !== "" && data.newmutant.afp !== null) {
                svmAllele = true;
                phenotypeAlreadySaved = true;
            } else if (data.newmutant.svm !== undefined && (data.newmutant.svm === "high" ||
                data.newmutant.svm === "medium")) {
                svmAllele = true;
            }
            let svmRNAi = false;
            if (data.rnai.afp !== undefined && data.rnai.afp !== "" && data.rnai.afp !== null) {
                svmRNAi = true;
                phenotypeAlreadySaved = true;
            } else if (data.rnai.svm !== undefined && (data.rnai.svm === "high" || data.rnai.svm === "medium")) {
                svmRNAi = true;
            }
            let svmTransgene = false;
            if (data.overexpr.afp !== undefined && data.overexpr.afp !== "" && data.overexpr.afp !== null) {
                svmTransgene = true;
                phenotypeAlreadySaved = true;
            } else if (data.overexpr.svm !== undefined && (data.overexpr.svm === "high" ||
                data.overexpr.svm === "medium")) {
                svmTransgene = true;
            }
            let svmProtein = false;
            let svmProteinDetails = "";
            if (data.invitro !== undefined && data.invitro.afp !== undefined && data.invitro.afp !== "" && data.invitro.afp !== null) {
                svmProtein = true;
                phenotypeAlreadySaved = true;
                if (data.invitro !== "yes") {
                    svmProteinDetails = data.invitro.afp;
                }
            }
            let chemical = false;
            if (data.chemphen.afp !== undefined && data.chemphen.afp !== "" && data.chemphen.afp !== null) {
                chemical = true;
                phenotypeAlreadySaved = true;
            }
            let env = false;
            if (data.envpheno.afp !== undefined && data.envpheno.afp !== "" && data.envpheno.afp !== null) {
                env = true;
                phenotypeAlreadySaved = true;
            }
            if (this.phenotype !== undefined) {
                this.phenotype.selfStateVarModifiedFunction(svmAllele, "cb_allele");
                this.phenotype.selfStateVarModifiedFunction(svmRNAi, "cb_rnai");
                this.phenotype.selfStateVarModifiedFunction(svmTransgene, "cb_transgene");
                this.phenotype.selfStateVarModifiedFunction(svmProtein, "cb_protein");
                this.phenotype.selfStateVarModifiedFunction(svmProteinDetails, "cb_protein_details");
                this.phenotype.selfStateVarModifiedFunction(chemical, "cb_chemical");
                this.phenotype.selfStateVarModifiedFunction(env, "cb_env");
                if (phenotypeAlreadySaved) {
                    this.phenotype.setSuccessAlertMessage();
                }
            }
            let diseaseAlreadySaved = false;
            let cb_orthologs = false;
            let cb_transgenic = false;
            let cb_modifiers = false;
            let disease_comments = "";
            if (data.humdis.afp !== undefined && data.humdis.afp !== "" && data.humdis.afp !== null) {
                let diseaseArr = data.humdis.afp.split(" | ");
                if (diseaseArr.length === 4) {
                    cb_orthologs = diseaseArr[0] === "yes";
                    cb_transgenic = diseaseArr[1] === "yes";
                    cb_modifiers = diseaseArr[2] === "yes";
                    disease_comments = diseaseArr[3];
                }
                diseaseAlreadySaved = true;
            }
            if (this.disease !== undefined) {
                this.disease.selfStateVarModifiedFunction(cb_orthologs, "cb_orthologs");
                this.disease.selfStateVarModifiedFunction(cb_transgenic, "cb_transgenic");
                this.disease.selfStateVarModifiedFunction(cb_modifiers, "cb_modifiers");
                this.disease.selfStateVarModifiedFunction(disease_comments, "comments");
                if (diseaseAlreadySaved) {
                    this.disease.setSuccessAlertMessage();
                }
            }
            let otherAlreadySaved = false;
            let other = "";
            if (data.comment.afp !== undefined && data.comment.afp !== "" && data.comment.afp !== null) {
                other = data.comment.afp;
                otherAlreadySaved = true;
            }
            if (this.other !== undefined) {
                this.other.selfStateVarModifiedFunction(other, "other");
                if (otherAlreadySaved) {
                    this.other.setSuccessAlertMessage();
                }
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
                other: other,
                orthologsDis: cb_orthologs,
                transgenicDis: cb_transgenic,
                modifiersDis: cb_modifiers,
                disComments: disease_comments,
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
                                                                  orthologs={this.state.orthologsDis}
                                                                  transgenic={this.state.transgenicDis}
                                                                  modifiers={this.state.modifiersDis}
                                                                  comments={this.state.disComments}
                                                                  stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                  toggleCb={this.toggle_cb}
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