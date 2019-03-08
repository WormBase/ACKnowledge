import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import Overview from "../pages/Overview";
import Expression from "../pages/Expression";
import {Alert, Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Reagent from "../pages/Reagent";
import Phenotypes from "../pages/Phenotypes";
import Interactions from "../pages/Interactions";
import Genetics from "../pages/Genetics";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import ContactInfo from "../pages/Comments";
import queryString from 'query-string';
import Title from "./Title";
import Disease from "../pages/Disease";
import Header from "./Header";
import {
    AFPValues, EntityList,
    getCheckboxDBVal,
    getCheckbxOrSingleFieldFromWBAPIData,
    getSetOfEntitiesFromWBAPIData, getTableValuesFromWBAPIData, transformEntitiesIntoAfpString
} from "../AFPValues";
import {DataSavedModal, SectionsNotCompletedModal, WelcomeModal} from "./MainModals";
import PersonSelector from "./PersonSelector";

export const WIDGET = Object.freeze({
    OVERVIEW: "overview",
    GENETICS: "genetics",
    REAGENT: "reagent",
    EXPRESSION: "expression",
    INTERACTIONS: "interactions",
    PHENOTYPES: "phenotypes",
    DISEASE: "disease",
    COMMENTS: "comments"
});

let MENU_INDEX = {};
MENU_INDEX[WIDGET.OVERVIEW] = 1;
MENU_INDEX[WIDGET.GENETICS] = 2;
MENU_INDEX[WIDGET.REAGENT] = 3;
MENU_INDEX[WIDGET.EXPRESSION] = 4;
MENU_INDEX[WIDGET.INTERACTIONS] = 5;
MENU_INDEX[WIDGET.PHENOTYPES] = 6;
MENU_INDEX[WIDGET.DISEASE] = 7;
MENU_INDEX[WIDGET.COMMENTS] = 8;

let WIDGET_TITLE = {};
WIDGET_TITLE[WIDGET.OVERVIEW] = "Overview (genes and species)";
WIDGET_TITLE[WIDGET.GENETICS] = "Genetics";
WIDGET_TITLE[WIDGET.REAGENT] = "Reagent";
WIDGET_TITLE[WIDGET.EXPRESSION] = "Expression";
WIDGET_TITLE[WIDGET.INTERACTIONS] = "Interactions";
WIDGET_TITLE[WIDGET.PHENOTYPES] = "Phenotypes and function";
WIDGET_TITLE[WIDGET.DISEASE] = "Disease";
WIDGET_TITLE[WIDGET.COMMENTS] = "Comments and submit";

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
            pages: [WIDGET.OVERVIEW, WIDGET.GENETICS, WIDGET.REAGENT, WIDGET.EXPRESSION, WIDGET.INTERACTIONS,
                WIDGET.PHENOTYPES, WIDGET.DISEASE, WIDGET.COMMENTS],
            selectedMenu: currSelectedMenu,
            completedSections: completedSections,
            showPopup: true,
            paper_id: parameters.paper,
            passwd: parameters.passwd,
            personid: parameters.personid,
            personFullname: undefined,
            show_fetch_data_error: false,
            show_data_saved: false,
            data_saved_success: true,
            data_saved_last_widget: false,
            selectedGenes: new Set(),
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
            hideStrains: parameters.hide_strains === "true"
        };
        this.handleSelectMenu = this.handleSelectMenu.bind(this);
        this.handleFinishedSection = this.handleFinishedSection.bind(this);
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.stateVarModifiedCallback = this.stateVarModifiedCallback.bind(this);
        this.setOverviewData = this.setOverviewData.bind(this);
        this.setGeneticsData = this.setGeneticsData.bind(this);
        this.setReagentData = this.setReagentData.bind(this);
        this.setExpressionData = this.setExpressionData.bind(this);
        this.setInteractionsData = this.setInteractionsData.bind(this);
        this.setPhenotypeData = this.setPhenotypeData.bind(this);
        this.setDiseaseData = this.setDiseaseData.bind(this);
        this.setCommentsData = this.setCommentsData.bind(this);
        this.setWidgetSaved = this.setWidgetSaved.bind(this);
        this.goToNextSection = this.goToNextSection.bind(this);
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

    /**
     * set the data in the overview widget
     *
     * @param {EntityList} genesList list of genes
     * @param {EntityList} speciesList list of species
     * @param {CheckboxWithDetails} genemodCb genemod correction update checkbox
     */
    setOverviewData(genesList, speciesList, genemodCb) {
        if (this.overview !== undefined) {
            this.overview.setSelectedGenes(genesList.entities());
            this.overview.setSelectedSpecies(speciesList.entities());
            this.overview.selfStateVarModifiedFunction(genemodCb.isChecked(), "cb_gmcorr");
            this.overview.selfStateVarModifiedFunction(genemodCb.details(), "cb_gmcorr_details");
        }
        this.setWidgetSaved(this.overview, "overview", ...arguments);
        this.setState({
            selectedGenes: genesList.entities(),
            selectedSpecies: speciesList.entities(),
            geneModCorrection: genemodCb.isChecked(),
            geneModCorrectionDetails: genemodCb.details()});
    }

    /**
     * set the data in the genetics widget
     *
     * @param {EntityList} variationList list of alleles
     * @param {EntityList} strainsList list of strains
     * @param {CheckboxWithDetails} alleleseqchangeCb checkbox for alleleseqchange
     * @param {EntityList} otherallelesTabRecords table records for other alleles
     * @param {EntityList} otherstrainTabRecords table records for other strains
     */
    setGeneticsData(variationList, strainsList, alleleseqchangeCb, otherallelesTabRecords, otherstrainTabRecords) {
        if (this.genetics !== undefined) {
            this.genetics.setSelectedAlleles(variationList.entities());
            this.genetics.setSelectedStrains(strainsList.entities());
            this.genetics.selfStateVarModifiedFunction(alleleseqchangeCb.isChecked(), "cb_allele");
            this.genetics.setOtherAlleles(otherallelesTabRecords.entities());
            this.genetics.setOtherStrains(otherstrainTabRecords.entities());
        }
        this.setWidgetSaved(this.genetics, "genetics", ...arguments);
        this.setState({
            selectedAlleles: variationList.entities(),
            alleleSeqChange: alleleseqchangeCb.isChecked(),
            selectedStrains: strainsList.entities(),
            otherAlleles: otherallelesTabRecords.entities(),
            otherStrains: otherstrainTabRecords.entities()
        });
    }

    /**
     * set data for the reagent widget
     *
     * @param {EntityList} transgenesList list of transgenes
     * @param {CheckboxWithDetails} newantibCb newantib checkbox
     * @param {EntityList} otherantibodiesList other antibodies table records
     * @param {EntityList} othertransgenesList other transgenes table records
     */
    setReagentData(transgenesList, newantibCb, otherantibodiesList, othertransgenesList) {
        if (this.reagent !== undefined) {
            this.reagent.setSelectedTransgenes(transgenesList.entities());
            this.reagent.selfStateVarModifiedFunction(newantibCb.isChecked(), "cb_newantib");
            this.reagent.selfStateVarModifiedFunction(newantibCb.details(), "cb_newantib_details");
            this.reagent.setOtherAntibodies(otherantibodiesList.entities());
            this.reagent.setOtherTransgenes(othertransgenesList.entities());
        }
        this.setWidgetSaved(this.reagent, "reagent", ...arguments);
        this.setState({
            selectedTransgenes: transgenesList.entities(),
            newAntib: newantibCb.isChecked(),
            otherAntibs: otherantibodiesList.entities(),
            otherTransgenes: othertransgenesList.entities()
        })
    }

    /**
     * set data for the expression widget
     *
     * @param {CheckboxWithDetails} anatomicexprCb
     * @param {CheckboxWithDetails} siteactionCb
     * @param {CheckboxWithDetails} timeactionCb
     * @param {CheckboxWithDetails} rnaseqCb
     * @param {CheckboxWithDetails} additionalexprVal
     */
    setExpressionData(anatomicexprCb, siteactionCb, timeactionCb, rnaseqCb, additionalexprVal) {
        if (this.expression !== undefined) {
            this.expression.selfStateVarModifiedFunction(anatomicexprCb.isChecked(), "cb_anatomic");
            this.expression.selfStateVarModifiedFunction(anatomicexprCb.details(), "cb_anatomic_details");
            this.expression.selfStateVarModifiedFunction(siteactionCb.isChecked(), "cb_site");
            this.expression.selfStateVarModifiedFunction(siteactionCb.details(), "cb_site_details");
            this.expression.selfStateVarModifiedFunction(timeactionCb.isChecked(), "cb_time");
            this.expression.selfStateVarModifiedFunction(timeactionCb.details(), "cb_time_details");
            this.expression.selfStateVarModifiedFunction(rnaseqCb.isChecked(), "cb_rna");
            this.expression.selfStateVarModifiedFunction(rnaseqCb.details(), "cb_rna_details");
            this.expression.selfStateVarModifiedFunction(additionalexprVal.details(), "additionalExpr");
        }
        this.setWidgetSaved(this.expression, "expression", ...arguments);
        this.setState({
            anatomicExpr: anatomicexprCb.isChecked(),
            anatomicExprDetails: anatomicexprCb.details(),
            siteAction: siteactionCb.isChecked(),
            siteActionDetails: siteactionCb.details(),
            timeAction: timeactionCb.isChecked(),
            timeActionDetails: timeactionCb.details(),
            rnaSeq: rnaseqCb.isChecked(),
            rnaSeqDetails: rnaseqCb.details(),
            additionalExpr: additionalexprVal.details()
        });
    }

    /**
     * set data for the interactions widget
     *
     * @param {CheckboxWithDetails} geneintCb
     * @param {CheckboxWithDetails} physintCb
     * @param {CheckboxWithDetails} generegCb
     */
    setInteractionsData(geneintCb, physintCb, generegCb) {
        if (this.interactions !== undefined) {
            this.interactions.selfStateVarModifiedFunction(geneintCb.isChecked(), "cb_genetic");
            this.interactions.selfStateVarModifiedFunction(geneintCb.details(), "cb_genetic_details");
            this.interactions.selfStateVarModifiedFunction(physintCb.isChecked(), "cb_physical");
            this.interactions.selfStateVarModifiedFunction(physintCb.details(), "cb_physical_details");
            this.interactions.selfStateVarModifiedFunction(generegCb.isChecked(), "cb_regulatory");
            this.interactions.selfStateVarModifiedFunction(generegCb.details(), "cb_regulatory_details");
        }
        this.setWidgetSaved(this.interactions, "interactions", ...arguments);
        this.setState({
            svmGeneInt: geneintCb.isChecked(),
            svmGeneIntDetails: geneintCb.details(),
            svmPhysInt: physintCb.isChecked(),
            svmPhysIntDetails: physintCb.details(),
            svmGeneReg: generegCb.isChecked(),
            svmGeneRegDetails: generegCb.details(),

        });
    }

    /**
     * set data for the phenotype widget
     *
     * @param {CheckboxWithDetails} alleleCb
     * @param {CheckboxWithDetails} rnaiCb
     * @param {CheckboxWithDetails} transgeneCb
     * @param {CheckboxWithDetails} proteinCb
     * @param {CheckboxWithDetails} chemicalCb
     * @param {CheckboxWithDetails} envCb
     */
    setPhenotypeData(alleleCb, rnaiCb, transgeneCb, proteinCb, chemicalCb, envCb) {
        if (this.phenotype !== undefined) {
            this.phenotype.selfStateVarModifiedFunction(alleleCb.isChecked(), "cb_allele");
            this.phenotype.selfStateVarModifiedFunction(rnaiCb.isChecked(), "cb_rnai");
            this.phenotype.selfStateVarModifiedFunction(transgeneCb.isChecked(), "cb_transgene");
            this.phenotype.selfStateVarModifiedFunction(proteinCb.isChecked(), "cb_protein");
            this.phenotype.selfStateVarModifiedFunction(proteinCb.details(), "cb_protein_details");
            this.phenotype.selfStateVarModifiedFunction(chemicalCb.isChecked(), "cb_chemical");
            this.phenotype.selfStateVarModifiedFunction(envCb.isChecked(), "cb_env");
        }
        this.setWidgetSaved(this.phenotype, "phenotypes", ...arguments);
        this.setState({
            svmAllele: alleleCb.isChecked(),
            svmRNAi: rnaiCb.isChecked(),
            svmTransgene: transgeneCb.isChecked(),
            svmProtein: proteinCb.isChecked(),
            svmProteinDetails: proteinCb.details(),
            chemical: chemicalCb.isChecked(),
            env: envCb.isChecked()
        })
    }

    /**
     * set data for the disease widget
     *
     * @param {CheckboxWithDetails} diseaseCb
     */
    setDiseaseData(diseaseCb) {
        if (this.disease !== undefined) {
            this.disease.selfStateVarModifiedFunction(diseaseCb.isChecked(), "cb_humdis");
            this.disease.selfStateVarModifiedFunction(diseaseCb.details(), "comments");
        }
        this.setWidgetSaved(this.disease, "disease", ...arguments);
        this.setState({
            humDis: diseaseCb.isChecked(),
            disComments: diseaseCb.details()
        });
    }

    /**
     * set data for the comments widget
     *
     * @param {CheckboxWithDetails} commentsCb
     */
    setCommentsData(commentsCb) {
        if (this.other !== undefined) {
            this.other.selfStateVarModifiedFunction(commentsCb.details(), "other");
        }
        this.setWidgetSaved(this.other, "comments", ...arguments);
        this.setState({
            other: commentsCb.details()
        });
    }

    componentDidMount() {
        fetch(process.env.REACT_APP_API_READ_ENDPOINT + '&paper=' + this.state.paper_id + '&passwd=' + this.state.passwd)
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
            let genesList;
            if (this.state.hideGenes) {
                genesList = new EntityList(new Set(), true);
            } else {
                genesList = getSetOfEntitiesFromWBAPIData(data.genestudied, data.genestudied, "WBGene");
            }
            let speciesList = getSetOfEntitiesFromWBAPIData(data.species, data.species, undefined);
            let structCorrcb = getCheckbxOrSingleFieldFromWBAPIData(data.structcorr, undefined);
            this.setOverviewData(genesList, speciesList, structCorrcb);
            let variationsList;
            if (this.state.hideAlleles) {
                variationsList = new EntityList(new Set(), true);
            } else {
                variationsList = getSetOfEntitiesFromWBAPIData(data.variation, data.variation, "");
            }
            let strainsList;
            if (this.state.hideStrains) {
                strainsList = new EntityList(new Set(), true);
            } else {
                strainsList = getSetOfEntitiesFromWBAPIData(data.strain, data.strain, undefined);
            }
            let seqChange = getCheckbxOrSingleFieldFromWBAPIData(data.seqchange, data.seqchange);
            let otherVariations = getTableValuesFromWBAPIData(data.othervariation, false);
            let otherStrains = getTableValuesFromWBAPIData(data.otherstrain, false);
            this.setGeneticsData(variationsList, strainsList, seqChange, otherVariations, otherStrains);
            this.setReagentData(getSetOfEntitiesFromWBAPIData(data.transgene, data.transgene, ""),
                getCheckbxOrSingleFieldFromWBAPIData(data.antibody, undefined),
                getTableValuesFromWBAPIData(data.otherantibody, true),
                getTableValuesFromWBAPIData(data.othertransgene, false));
            this.setExpressionData(getCheckbxOrSingleFieldFromWBAPIData(data.otherexpr, data.otherexpr),
                getCheckbxOrSingleFieldFromWBAPIData(data.siteaction, undefined),
                getCheckbxOrSingleFieldFromWBAPIData(data.timeaction, undefined),
                getCheckbxOrSingleFieldFromWBAPIData(data.rnaseq, undefined),
                getCheckbxOrSingleFieldFromWBAPIData(data.additionalexpr, undefined));
            this.setInteractionsData(getCheckbxOrSingleFieldFromWBAPIData(data.geneint, data.geneint),
                getCheckbxOrSingleFieldFromWBAPIData(data.geneprod, data.geneprod),
                getCheckbxOrSingleFieldFromWBAPIData(data.genereg, data.genereg));
            this.setPhenotypeData(getCheckbxOrSingleFieldFromWBAPIData(data.newmutant, data.newmutant),
                getCheckbxOrSingleFieldFromWBAPIData(data.rnai, data.rnai),
                getCheckbxOrSingleFieldFromWBAPIData(data.overexpr, data.overexpr),
                getCheckbxOrSingleFieldFromWBAPIData(data.catalyticact, undefined),
                getCheckbxOrSingleFieldFromWBAPIData(data.chemphen, undefined),
                getCheckbxOrSingleFieldFromWBAPIData(data.envpheno, undefined));
            this.setDiseaseData(getCheckbxOrSingleFieldFromWBAPIData(data.humdis, undefined));
            this.setCommentsData(getCheckbxOrSingleFieldFromWBAPIData(data.comment, undefined));
        });
        let payload = {};
        payload.passwd = this.state.passwd;
        payload.person_id = this.state.personid;
        fetch(process.env.REACT_APP_API_DB_READ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                this.setState({
                    show_fetch_data_error: true
                });
            }
        }).then(data => {
            if (data === undefined) {
                this.setState({
                    show_fetch_data_error: true
                });
            }
            this.setState({ personFullname: data["fullname"] });
            if (this.personSelector !== undefined) {
                this.personSelector.setPersonFullname(data["fullname"]);
            }
        }).catch((err) => {
            this.setState({
                show_fetch_data_error: true
            });
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
                        alleles_list: transformEntitiesIntoAfpString(this.state.selectedAlleles, "WBVar"),
                        allele_seq_change: getCheckboxDBVal(this.state.alleleSeqChange),
                        other_alleles: JSON.stringify(this.state.otherAlleles),
                        strains_list: transformEntitiesIntoAfpString(this.state.selectedStrains, ""),
                        other_strains: JSON.stringify(this.state.otherStrains)
                    };
                    break;
                case WIDGET.REAGENT:
                    payload = {
                        transgenes_list: transformEntitiesIntoAfpString(this.state.selectedTransgenes,
                            "WBTransgene"),
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
            fetch(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.status === 200) {
                    return res.text();
                } else {
                    this.setState({
                        show_data_saved: true,
                        data_saved_success: false
                    });
                }
            }).then(data => {
                if (data === undefined) {
                    this.setState({
                        show_data_saved: true,
                        data_saved_success: false
                    });
                }
                this.setState({
                    show_data_saved: true,
                    data_saved_success: true,
                    data_saved_last_widget: widget === WIDGET.COMMENTS
                });
                const newCompletedSections = this.state.completedSections;
                newCompletedSections[widget] = true;
                this.setState({completedSections: newCompletedSections});
            }).catch((err) => {
                this.setState({
                    show_data_saved: true,
                    data_saved_success: false
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
        let overviewOk = this.state.completedSections[WIDGET.OVERVIEW] ? <Glyphicon glyph="ok"/> : false;
        let expressionOk = this.state.completedSections[WIDGET.EXPRESSION] ? <Glyphicon glyph="ok"/> : false;
        let geneticsOk = this.state.completedSections[WIDGET.GENETICS] ? <Glyphicon glyph="ok"/>: false;
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
                    <Title title={title} journal={parameters.journal} pmid={parameters.pmid}/><br/>
                    <div>
                        <div>
                            <div className="col-sm-4">
                                <div className="panel panel-default">
                                    <div className="panel-body">
                                        <Nav bsStyle="pills" stacked onSelect={this.handleSelectMenu}>
                                            <IndexLinkContainer to={WIDGET.OVERVIEW + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.OVERVIEW]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.OVERVIEW]}>{WIDGET_TITLE[WIDGET.OVERVIEW]}
                                                    &nbsp;{overviewOk}
                                                </NavItem></IndexLinkContainer>
                                            <IndexLinkContainer to={WIDGET.GENETICS + this.props.location.search}
                                                                active={this.state.selectedMenu === MENU_INDEX[WIDGET.GENETICS]}>
                                                <NavItem eventKey={MENU_INDEX[WIDGET.GENETICS]}>{WIDGET_TITLE[WIDGET.GENETICS]}&nbsp;{geneticsOk}</NavItem>
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
                                        <PersonSelector fullname={this.state.personFullname}
                                                        personid={this.state.personid}
                                                        ref={instance => { this.personSelector = instance; }}
                                        />
                                    </div>
                                </div>
                                <div className="panel panel-default">
                                    <div className="panel-body">
                                        <Route exact path="/" render={() => (<Redirect to={"/overview" + this.props.location.search}/>)}/>
                                        <Route path={"/" + WIDGET.OVERVIEW}
                                               render={() => <Overview callback={this.handleFinishedSection}
                                                                       saved={this.state.completedSections[WIDGET.OVERVIEW]}
                                                                       ref={instance => { this.overview = instance; }}
                                                                       selectedGenes={this.state.selectedGenes}
                                                                       geneModCorr={this.state.geneModCorrection}
                                                                       geneModCorrDetails={this.state.geneModCorrectionDetails}
                                                                       selectedSpecies={this.state.selectedSpecies}
                                                                       stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                       toggleCb={this.toggle_cb}
                                                                       checkCb={this.check_cb}
                                                                       hideGenes={this.state.hideGenes}
                                               />}
                                        />
                                        <Route path={"/" + WIDGET.GENETICS}
                                               render={() => <Genetics  callback={this.handleFinishedSection}
                                                                        saved={this.state.completedSections[WIDGET.GENETICS]}
                                                                        ref={instance => { this.genetics = instance; }}
                                                                        selectedAlleles={this.state.selectedAlleles}
                                                                        selectedStrains={this.state.selectedStrains}
                                                                        stateVarModifiedCallback={this.stateVarModifiedCallback}
                                                                        alleleSeqChange={this.state.alleleSeqChange}
                                                                        otherAlleles={this.state.otherAlleles}
                                                                        otherStrains={this.state.otherStrains}
                                                                        toggleCb={this.toggle_cb}
                                                                        checkCb={this.check_cb}
                                                                        hideAlleles={this.state.hideAlleles}
                                                                        hideStrains={this.state.hideStrains}
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
                                            ref={instance => { this.other = instance; }}
                                        />}/>
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

export default withRouter(MenuAndWidgets);