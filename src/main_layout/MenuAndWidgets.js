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
import queryString from 'query-string'
import Title from "./Title";

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
            case "/other":
                currSelectedMenu = 7;
                break;
            case "/contact_info":
                currSelectedMenu = 8;
                break;
            default:
                currSelectedMenu = 1;
        }
        let parameters = queryString.parse(this.props.location.search);
        this.state = {
            pages: ["overview", "genetics", "reagent", "expression", "interactions", "phenotypes", "other",
                "contact_info"],
            selectedMenu: currSelectedMenu,
            completedSections: {"overview": false, "expression": false, "genetics": false, "interactions": false,
                "phenotypes": false, "reagent": false, "other": false, "contact_info": false},
            showPopup: true,
            paper_id: parameters.paper,
            passwd: parameters.passwd,
            show_fetch_data_error: false,
            selecedGenes: new Set(),
            geneModCorrection: false,
            selectedSpecies: new Set(),
            selectedAlleles: new Set(),
            alleleSeqChange: false,
            selectedStrains: new Set(),
            selectedTransgenes: new Set(),
            newAntib: false,
            otherAntibs: [
                {
                    id: 1,
                    antibody: "",
                    publicationId: ""
                }
            ],
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
            other: ""
        };
        this.handleSelectMenu = this.handleSelectMenu.bind(this);
        this.handleFinishedSection = this.handleFinishedSection.bind(this);
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.selectedGenesModifiedCallback = this.selectedGenesModifiedCallback.bind(this);
        this.selectedSpeciesModifiedCallback = this.selectedSpeciesModifiedCallback.bind(this);
        this.selectedAllelesModifiedCallback = this.selectedAllelesModifiedCallback.bind(this);
        this.selectedStrainsModifiedCallback = this.selectedStrainsModifiedCallback.bind(this);
        this.selectedTransgenesModifiedCallback = this.selectedTransgenesModifiedCallback.bind(this);
        this.svmGeneIntChangedCallback = this.svmGeneIntChangedCallback.bind(this);
        this.svmPhysIntChangedCallback = this.svmPhysIntChangedCallback.bind(this);
        this.svmGeneRegChangedCallback = this.svmGeneRegChangedCallback.bind(this);
        this.svmAlleleChangedCallback = this.svmAlleleChangedCallback.bind(this);
        this.svmRNAiChangedCallback = this.svmRNAiChangedCallback.bind(this);
        this.svmTransgeneChangedCallback = this.svmTransgeneChangedCallback.bind(this);
        this.svmProteinChangedCallback = this.svmProteinChangedCallback.bind(this);
        this.svmGeneIntDetailsChangedCallback = this.svmGeneIntDetailsChangedCallback.bind(this);
        this.svmPhysIntDetailsChangedCallback = this.svmPhysIntDetailsChangedCallback.bind(this);
        this.svmGeneRegDetailsChangedCallback = this.svmGeneRegDetailsChangedCallback.bind(this);
        this.svmProteinDetailsChangedCallback = this.svmProteinDetailsChangedCallback.bind(this);
        this.chemicalChangedCallback = this.chemicalChangedCallback.bind(this);
        this.envChangedCallback = this.envChangedCallback.bind(this);
        this.geneModCorrModifiedCallback = this.geneModCorrModifiedCallback.bind(this);
        this.geneModCorrDetailsModifiedCallback = this.geneModCorrDetailsModifiedCallback.bind(this);
        this.alleleSeqChangeModifiedCallback = this.alleleSeqChangeModifiedCallback.bind(this);
        this.newAntibModifiedCallback = this.newAntibModifiedCallback.bind(this);
        this.newAntibDetailsModifiedCallback = this.newAntibDetailsModifiedCallback.bind(this);
        this.otherAntibsModifiedCallback = this.otherAntibsModifiedCallback.bind(this);
        this.anatomicExprModifiedCallback = this.anatomicExprModifiedCallback.bind(this);
        this.anatomicExprDetailsModifiedCallback = this.anatomicExprDetailsModifiedCallback.bind(this);
        this.siteActionModifiedCallback = this.siteActionModifiedCallback.bind(this);
        this.siteActionDetailsModifiedCallback = this.siteActionDetailsModifiedCallback.bind(this);
        this.timeActionModifiedCallback = this.timeActionModifiedCallback.bind(this);
        this.timeActionDetailsModifiedCallback = this.timeActionDetailsModifiedCallback.bind(this);
        this.rnaSeqModifiedCallback = this.rnaSeqModifiedCallback.bind(this);
        this.rnaSeqDetailsModifiedCallback= this.rnaSeqDetailsModifiedCallback.bind(this);
        this.additionalExprModifiedCallback = this.additionalExprModifiedCallback.bind(this);
        this.otherModifiedCallback = this.otherModifiedCallback.bind(this);
    }

    static split_tfp_entities(entities_string, prefix) {
        let entities_split = entities_string.split(" | ");
        let final_entities_list = Array();
        for (let i in entities_split) {
            let entity_split = entities_split[i].split(";%;");
            final_entities_list.push(entity_split[1] + " (" + prefix + entity_split[0] + ")");
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
            //if (data.genemodcorr.afp !== undefined && data.genemodcorr.afp !== "no") {
            //    genemodCorrection = true;
            //    geneModCorrectionDetails = data.genemodcorr.afp;
            //}
            let selectedSpecies = new Set();
            if (data.species.afp !== undefined && data.species.afp !== "" && data.species.afp !== null) {
                selectedSpecies = MenuAndWidgets.split_tfp_entities(data.species.afp, "Taxon ID ");
            } else if (data.species.tfp !== undefined && data.species.tfp !== "") {
                selectedSpecies = MenuAndWidgets.split_tfp_entities(data.species.tfp, "Taxon ID ");
            }
            if (this.overview !== undefined) {
                this.overview.setSelectedGenes(selectedGenes);
                this.overview.setSelecedSpecies(selectedSpecies);
                this.overview.setGMCorrection(genemodCorrection);
                this.overview.setGMCorrectionDetails(genemodCorrectionDetails);
            }
            let selectedAlleles = new Set();
            if (data.variation.afp !== undefined && data.variation.afp !== "" && data.variation.afp !== null) {
                selectedAlleles = MenuAndWidgets.split_tfp_entities(data.variation.afp, "");
            } else if (data.variation.tfp !== undefined && data.variation.tfp !== "") {
                selectedAlleles = MenuAndWidgets.split_tfp_entities(data.variation.tfp, "");
            }
            let alleleSeqChange = false;
            //if (data.alleleseqchange.afp !== undefined && data.alleleseqchange.afp !== "no") {
            //    alleleSeqChange = true;
            //}
            let selectedStrains = new Set();
            if (data.strain.afp !== undefined && data.strain.afp !== "" && data.strain.afp !== null) {
                selectedStrains = data.strain.afp.split(" | ");
            } else if (data.strain.tfp !== undefined && data.strain.tfp !== "") {
                selectedStrains = data.strain.tfp.split(" | ");
            }
            if (this.genetics !== undefined) {
                this.genetics.setSelectedAlleles(selectedAlleles);
                this.genetics.setSelecedStrains(selectedStrains);
                this.genetics.setAlleleSeqChange(alleleSeqChange);
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
            } else if (data.antibody.svm !== undefined && (data.antibody.svm === "high" ||
                data.antibody.svm === "medium")) {
                newAntib = true;
            }
            let otherAntibodies = [
                {
                    id: 1,
                    antibody: "",
                    publicationId: ""
                }
            ];
            //if (data.otherantibodies.afp !== undefined && data.otherantibodies.afp !== "") {
            //    otherAntibodies = data.otherantibodies.afp;
            //}
            if (this.reagent !== undefined) {
                this.reagent.setSelectedTransgenes(selectedTransgenes);
                this.reagent.setNewAntib(newAntib);
                this.reagent.setNewAntibDetails(newAntibDetails);
                this.reagent.setOtherAntib(otherAntibodies);
            }
            let anatomicExpr = false;
            let anatomicExprDetails = "";
            //if (data.anatomicexpr.afp !== undefined && data.anatomicexpr.afp !== "no") {
            //    anatomicExpr = true;
            //    anatomicExprDetails = data.anatomicexpr.afp;
            //}
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
            //if (data.rnaseq.afp !== undefined && data.rnaseq.afp !== null && data.rnaseq.afp !== "no") {
            //    rnaSeq = true;
            //    rnaSeq = data.rnaseq.afp;
            //}
            let additionalExpr = "";
            //if (data.additionalexpr.afp !== undefined && data.additionalexpr.afp !== null && data.additionalexpr.afp !== "") {
            //    additionalExpr = data.additionalexpr.afp;
            //}
            if (this.expression !== undefined) {
                this.expression.setAnatomicExpr(anatomicExpr);
                this.expression.setAnatomicExprDetails(anatomicExprDetails);
                this.expression.setSiteAction(siteAction);
                this.expression.setSiteActionDetails(siteActionDetails);
                this.expression.setTimeAction(timeAction);
                this.expression.setTimeActionDetails(timeActionDetails);
                this.expression.setRnaSeq(rnaSeq);
                this.expression.setRnaSeqDetails(rnaSeqDetails);
                this.expression.setAdditionalExpr(additionalExpr);
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
                    this.interactions.check_cb_genetic();
                    this.interactions.set_cb_genetic_details(svmGeneIntDetails);
                }
                if (svmPhysInt === true) {
                    this.interactions.check_cb_physical();
                    this.interactions.set_cb_physical_details(svmPhysIntDetails);
                }
                if (svmGeneReg === true) {
                    this.interactions.check_cb_regulatory();
                    this.interactions.set_cb_regulatory_details(svmGeneRegDetails);
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
            if (data.catalyticact.afp !== undefined && data.catalyticact.afp !== "" && data.catalyticact.afp !== null) {
                svmProtein = true;
                svmProteinDetails = data.catalyticact.afp;
            } else if (data.catalyticact.svm !== undefined && (data.catalyticact.svm === "high" ||
                data.catalyticact.svm === "medium")) {
                svmProtein = true;
            }
            let chemical = false;
            if (data.chemicals.afp !== undefined && data.chemicals.afp !== "" && data.chemicals.afp !== null) {
                chemical = true;
            }
            let env = false;
            //if (data.envpheno.afp !== undefined && data.envpheno.afp !== "" && data.envpheno.afp !== null) {
            //    env = true;
            //}
            if (this.phenotype !== undefined) {
                if (svmAllele === true) {
                    this.phenotype.check_cb_allele();
                }
                if (svmRNAi === true) {
                    this.phenotype.check_cb_rnai();
                }
                if (svmTransgene === true) {
                    this.phenotype.check_cb_transgene();
                }
                if (svmProtein === true) {
                    this.phenotype.check_cb_protein();
                    this.phenotype.set_cb_protein_details(svmProteinDetails);
                }
                if (chemical === true) {
                    this.phenotype.check_cb_chemical();
                }
                if (env === true) {
                    this.phenotype.check_cb_env();
                }
            }
            let other = "";
            if (data.comment.afp !== undefined && data.comment.afp !== "" && data.comment.afp !== null) {
                other = data.comment.afp;
            }
            if (this.other !== undefined) {
                this.other.setOther(other);
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

    selectedGenesModifiedCallback(newGenesList) {
        this.setState({
            selectedGenes: newGenesList
        });
    }

    selectedSpeciesModifiedCallback(newSpeciesList) {
        this.setState({
            selectedSpecies: newSpeciesList
        });
    }

    selectedAllelesModifiedCallback(newAlleleList) {
        this.setState({
            selectedAlleles: newAlleleList
        });
    }

    selectedStrainsModifiedCallback(newStrainsList) {
        this.setState({
            selectedStrains: newStrainsList
        });
    }

    selectedTransgenesModifiedCallback(newTransgenesList) {
        this.setState({
            selectedTransgenes: newTransgenesList
        });
    }

    svmGeneIntChangedCallback(value) {
        this.setState({
            svmGeneInt: value
        });
    }

    svmPhysIntChangedCallback(value) {
        this.setState({
            svmPhysInt: value
        });
    }

    svmGeneRegChangedCallback(value) {
        this.setState({
            svmGeneReg: value
        });
    }

    svmAlleleChangedCallback(value) {
        this.setState({
            svmAllele: value
        });
    }

    svmRNAiChangedCallback(value) {
        this.setState({
            svmRNAi: value
        });
    }

    svmTransgeneChangedCallback(value) {
        this.setState({
            svmTransgene: value
        });
    }

    svmProteinChangedCallback(value) {
        this.setState({
            svmProtein: value
        });
    }

    svmGeneIntDetailsChangedCallback(value) {
        this.setState({
            svmGeneIntDetails: value
        });
    }

    svmPhysIntDetailsChangedCallback(value) {
        this.setState({
            svmPhysIntDetails: value
        });
    }

    svmGeneRegDetailsChangedCallback(value) {
        this.setState({
            svmGeneRegDetails: value
        });
    }

    svmProteinDetailsChangedCallback(value) {
        this.setState({
            svmProteinDetails: value
        });
    }

    geneModCorrModifiedCallback(value) {
        this.setState({
           geneModCorrection: value
        });
    }

    geneModCorrDetailsModifiedCallback(value) {
        this.setState({
            geneModCorrectionDetails: value
        });
    }

    alleleSeqChangeModifiedCallback(value) {
        this.setState({
            alleleSeqChange: value
        });
    }

    newAntibModifiedCallback(value) {
        this.setState({
            newAntib: value
        });
    }

    newAntibDetailsModifiedCallback(value) {
        this.setState({
            newAntibDetails: value
        });
    }

    otherAntibsModifiedCallback(values) {
        this.setState({
            otherAntibs: values
        });
    }

    anatomicExprModifiedCallback(value) {
        this.setState({
            anatomicExpr: value
        });
    }

    anatomicExprDetailsModifiedCallback(value) {
        this.setState({
            anatomicExprDetails: value
        });
    }

    siteActionModifiedCallback(value) {
        this.setState({
            siteAction: value
        });
    }

    siteActionDetailsModifiedCallback(value) {
        this.setState({
            siteActionDetails: value
        });
    }

    timeActionModifiedCallback(value) {
        this.setState({
            timeAction: value
        });
    }

    timeActionDetailsModifiedCallback(value) {
        this.setState({
            timeActionDetails: value
        });
    }

    rnaSeqModifiedCallback(value) {
        this.setState({
            rnaSeq: value
        });
    }

    rnaSeqDetailsModifiedCallback(value) {
        this.setState({
            rnaSeqDetails: value
        });
    }

    additionalExprModifiedCallback(value) {
        this.setState({
            additionalExpr: value
        });
    }

    chemicalChangedCallback(value) {
        this.setState({
            chemical: value
        });
    }

    envChangedCallback(value) {
        this.setState({
            env: value
        });
    }

    otherModifiedCallback(other) {
        this.setState({
           other: other
        });
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
                <Glyphicon glyph="warning-sign"/> <strong>Oooops!</strong><br/>
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
                                        <IndexLinkContainer to={"other" + this.props.location.search} active={this.state.selectedMenu === 7}>
                                            <NavItem eventKey={7}>Anything else?&nbsp;{otherOk}</NavItem></IndexLinkContainer>
                                        <IndexLinkContainer to={"contact_info" + this.props.location.search} active={this.state.selectedMenu === 8}>
                                            <NavItem eventKey={8}>Update contact info&nbsp;{contact_infoOk}</NavItem>
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
                                                                   geneModCorrCallback={this.geneModCorrModifiedCallback}
                                                                   geneModCorrDetails={this.state.geneModCorrectionDetails}
                                                                   geneModCorrDetailsCallback={this.geneModCorrDetailsModifiedCallback}
                                                                   selectedSpecies={this.state.selectedSpecies}
                                                                   selectedGenesCallback={this.selectedGenesModifiedCallback}
                                                                   selectedSpeciesCallback={this.selectedSpeciesModifiedCallback}
                                           />}
                                    />
                                    <Route path="/genetics"
                                           render={() => <Genetics  callback={this.handleFinishedSection}
                                                                    saved={this.state.completedSections["genetics"]}
                                                                    ref={instance => { this.genetics = instance; }}
                                                                    selectedAlleles={this.state.selectedAlleles}
                                                                    selectedStrains={this.state.selectedStrains}
                                                                    selectedAllelesCallback={this.selectedAllelesModifiedCallback}
                                                                    selectedStrainsCallback={this.selectedStrainsModifiedCallback}
                                                                    alleleSeqChange={this.state.alleleSeqChange}
                                                                    alleleSeqChangeCallback={this.alleleSeqChangeModifiedCallback}
                                           />}
                                    />
                                    <Route path="/reagent"
                                           render={() => <Reagent callback={this.handleFinishedSection}
                                                                  saved={this.state.completedSections["reagent"]}
                                                                  selectedTransgenes={this.state.selectedTransgenes}
                                                                  selectedTransgenesCallback={this.selectedTransgenesModifiedCallback}
                                                                  newAntib={this.state.newAntib}
                                                                  newAntibCallback={this.newAntibModifiedCallback}
                                                                  newAntibDetails={this.state.newAntibDetails}
                                                                  newAntibDetailsCallback={this.newAntibDetailsModifiedCallback}
                                                                  otherAntibs={this.state.otherAntibs}
                                                                  otherAntibsCallback={this.otherAntibsModifiedCallback}
                                           />}
                                    />
                                    <Route path="/expression"
                                           render={() => <Expression callback={this.handleFinishedSection}
                                                                     saved={this.state.completedSections["expression"]}
                                                                     anatomicExpr={this.state.anatomicExpr}
                                                                     anatomicExprCallback={this.anatomicExprModifiedCallback}
                                                                     anatomicExprDetails={this.state.anatomicExprDetails}
                                                                     anatomicExprDetailsCallback={this.anatomicExprDetailsModifiedCallback}
                                                                     siteAction={this.state.siteAction}
                                                                     siteActionCallback={this.siteActionModifiedCallback}
                                                                     siteActionDetails={this.state.siteActionDetails}
                                                                     siteActionDetailsCallback={this.siteActionDetailsModifiedCallback}
                                                                     timeAction={this.state.timeAction}
                                                                     timeActionCallback={this.timeActionModifiedCallback}
                                                                     timeActionDetails={this.state.timeActionDetails}
                                                                     timeActionDetailsCallback={this.timeActionDetailsModifiedCallback}
                                                                     rnaSeq={this.state.rnaSeq}
                                                                     rnaSeqCallback={this.rnaSeqModifiedCallback}
                                                                     rnaSeqDetails={this.state.rnaSeqDetails}
                                                                     rnaSeqDetailsCallback={this.rnaSeqDetailsModifiedCallback}
                                                                     additionalExpr={this.state.additionalExpr}
                                                                     additionalExprCallback={this.additionalExprModifiedCallback}
                                           />}
                                    />
                                    <Route path="/interactions"
                                           render={() => <Interactions
                                               callback={this.handleFinishedSection}
                                               saved={this.state.completedSections["interactions"]}
                                               ref={instance => { this.interactions = instance; }}
                                               svmGeneIntChanged={this.svmGeneIntChangedCallback}
                                               svmPhysIntChanged={this.svmPhysIntChangedCallback}
                                               svmGeneRegChanged={this.svmGeneRegChangedCallback}
                                               cb_genetic={this.state.svmGeneInt}
                                               cb_physical={this.state.svmPhysInt}
                                               cb_regulatory={this.state.svmGeneReg}
                                               cb_genetic_details={this.state.svmGeneIntDetails}
                                               cb_physical_details={this.state.svmPhysIntDetails}
                                               cb_regulatory_details={this.state.svmGeneRegDetails}
                                               svmGeneIntDetailsChanged={this.svmGeneIntDetailsChangedCallback}
                                               svmPhysIntDetailsChanged={this.svmPhysIntDetailsChangedCallback}
                                               svmGeneRegDetailsChanged={this.svmGeneRegDetailsChangedCallback}
                                           />}
                                    />
                                    <Route path="/phenotypes"
                                           render={() => <Phenotypes
                                               callback={this.handleFinishedSection}
                                               saved={this.state.completedSections["phenotypes"]}
                                               svmAlleleChanged={this.svmAlleleChangedCallback}
                                               svmRNAiChanged={this.svmRNAiChangedCallback}
                                               svmTransgeneChanged={this.svmTransgeneChangedCallback}
                                               svmProteinChanged={this.svmProteinChangedCallback}
                                               cb_allele={this.state.svmAllele}
                                               cb_rnai={this.state.svmRNAi}
                                               cb_transgene={this.state.svmTransgene}
                                               cb_protein={this.state.svmProtein}
                                               cb_transgene_details={this.state.svmTransgeneDetails}
                                               cb_protein_details={this.state.svmProteinDetails}
                                               svmProteinDetailsChanged={this.svmProteinDetailsChangedCallback}
                                               cb_chemical={this.state.chemical}
                                               chemicalChanged={this.chemicalChangedCallback}
                                               cb_env={this.state.env}
                                               envChanged={this.envChangedCallback}
                                               ref={instance => { this.phenotype = instance; }}
                                           />}
                                    />
                                    <Route path="/other"
                                           render={() => <Other
                                               callback={this.handleFinishedSection}
                                               saved={this.state.completedSections["other"]}
                                               other={this.state.other}
                                               otherCallback={this.otherModifiedCallback}
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