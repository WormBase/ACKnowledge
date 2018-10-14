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

class AFPValue {
    constructor(prevSaved) {
        if (new.target === AFPValue) {
            throw new TypeError("Cannot construct Abstract instances directly");
        } else {
            this._prevSaved = prevSaved;
        }
    }

    prevSaved() {
        return this._prevSaved;
    }
}

class EntityList extends AFPValue{
    constructor(entities, prevSaved) {
        super(prevSaved);
        this._entities = entities;
    }
    entities() {
        return this._entities;
    }
}

class CheckboxWithDetails extends AFPValue{
    constructor(isCheched, details, prevSaved) {
        super(prevSaved);
        this._isChecked = isCheched;
        this._details = details;
    }
    isChecked() {
        return this._isChecked;
    }
    details() {
        return this._details;
    }
}

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
                currSelectedMenu = 8;
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
        this.setOverviewData = this.setOverviewData.bind(this);
        this.setGeneticsData = this.setGeneticsData.bind(this);
        this.setReagentData = this.setReagentData.bind(this);
        this.setExpressionData = this.setExpressionData.bind(this);
        this.setInteractionsData = this.setInteractionsData.bind(this);
        this.setPhenotypeData = this.setPhenotypeData.bind(this);
        this.setDiseaseData = this.setDiseaseData.bind(this);
        this.setCommentsData = this.setCommentsData.bind(this);
        this.setWidgetSaved = this.setWidgetSaved.bind(this);
    }

    /**
     * extract an array of entities from a string read from TFP tables in WB data base.
     *
     * list of entities in TFP tables in WB DB  in string format, separated by pipes with whitespaces (" | "). Each
     * entity can also have an ID or other additional information within it. The special character separator ;%; is used
     * to separate entities from their respective additional data.
     *
     * @param {string} entitiesString a string containing a list of entities, in WB data base format
     * @param {string} prefix an optional prefix to be added to the additional information in the entities (e.g., WBGene for gene
     * ids, which are usually stored in the DB without prefix)
     * @returns {string[]} an array of entities, in the form "entity_name ( entity_extra_info )", where the round
     * brackets and the extra_info field are returned only if additional information is present for the entities
     */
    static extractEntitiesFromTfpString(entitiesString, prefix) {
        let entities_split = entitiesString.split(" | ");
        let final_entities_list = Array();
        for (let i in entities_split) {
            let entity_split = entities_split[i].split(";%;");
            final_entities_list.push(entity_split[1] + " ( " + prefix + entity_split[0] + " )");
        }
        return final_entities_list;
    }

    /**
     * get a set of entities for a specific data type from a data object returned by WB API
     *
     * WB API returns a data object with all tfp_*, afp_*, and svm_* tables and their values for a specific paper. This
     * function extracts a set of entities for a data type if the latter has values in afp_ or tfp_ tables. Afp tables
     * are searched first; if their values are undefined or null, tfp tables are searched next.
     *
     * @param {string} afpString string containing data for a data type coming from afp tables
     * @param {string} tfpString string containing data for a data type coming from tfp tables
     * @param {string} entityPrefix optional prefix to be attached to additional information for each entity
     * @returns {EntityList} an object containing the set of entities in first position and a boolean indicating
     * whether the data came from afp tables
     */
    static getSetOfEntitiesFromWBAPIData(afpString, tfpString, entityPrefix) {
        if (afpString !== undefined && afpString.afp !== undefined && afpString.afp !== null) {
            if (afpString.afp !== "") {
                if (entityPrefix !== null) {
                    return new EntityList(MenuAndWidgets.extractEntitiesFromTfpString(afpString.afp, entityPrefix),
                        true);
                } else {
                    return new EntityList(afpString.afp.split(" | "), true);
                }
            } else {
                return new EntityList(new Set(), true);
            }
        } else if (tfpString !== undefined && tfpString.tfp !== undefined && tfpString.tfp !== "" &&
            tfpString.tfp !== null) {
            if (entityPrefix !== null) {
                return new EntityList(MenuAndWidgets.extractEntitiesFromTfpString(tfpString.tfp, entityPrefix), false);
            } else {
                return new EntityList(tfpString.tfp.split(" | "), false);
            }
        } else {
            return new EntityList(new Set(), false)
        }
    }

    /**
     * get a checkbox value with its associated text for a specific data type from a data object returned by WB API
     *
     * WB API returns a data object with all tfp_*, afp_*, and svm_* tables and their values for a specific paper. This
     * function extracts a checkbox value with its optional text for a data type if the latter has values in afp_ or
     * svm_ tables. Afp tables are searched first; if their values are undefined or null, svm tables are searched next.
     *
     * This function can be used also to retrieve the value of a textual field. In this case the checkbox value is
     * set to true if the text is not empty.
     *
     * @param {string} afpString string containing data for a data type coming from afp tables
     * @param {string} svmString string containing data for a data type coming from svm tables
     * @returns {CheckboxWithDetails} an object containing the checkbox value, the text associated with the checkbox
     * or the value of a textual field in second position, and whether the values come from afp tables
     */
    static getCheckbxOrSingleFieldFromWBAPIData(afpString, svmString) {
        if (afpString !== undefined && afpString.afp !== undefined && afpString.afp !== null) {
            if (afpString.afp !== "") {
                return new CheckboxWithDetails(true, afpString.afp, true);
            } else {
                return new CheckboxWithDetails(false, "", true);
            }
        } else if (svmString !== undefined && svmString !== null && svmString.svm !== null &&
            svmString.svm !== undefined && (svmString.svm === "high" || svmString.svm === "medium")) {
            return new CheckboxWithDetails(true, "", false);
        } else {
            return new CheckboxWithDetails(false, "", false);
        }
    }

    /**
     * get table records for a specific data type from a data object returned by WB API
     *
     * WB API returns a data object with all tfp_*, afp_*, and svm_* tables and their values for a specific paper. This
     * function extracts an array of table records for a data type if the latter has values in afp_.
     *
     * @param {string} afpString string containing data for a data type coming from afp tables
     * @param {boolean} multicolumn whether the table contains two columns
     * @returns {EntityList}
     */
    static getTableValuesFromWBAPIData(afpString, multicolumn) {
        let emptyVal = [ { id: 1, name: "" } ];
        if (multicolumn) {
            emptyVal = [ { id: 1, name: "", publicationId: "" } ];
        }
        if (afpString !== undefined && afpString.afp !== null) {
            if (afpString.afp !== "") {
                return new EntityList(JSON.parse(afpString.afp), true);
            } else {
                return new EntityList(emptyVal, true);
            }
        } else {
            return new EntityList(emptyVal, false);
        }
    }

    /**
     * change a widget state to saved and modify its alert message depending on the status of the passed arguments
     * @param widget the widget to modify
     * @param {string} sectionName
     * @param {AFPValue} params a list of arguments
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
            this.overview.setSelecedSpecies(speciesList.entities());
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
            this.genetics.setSelecedStrains(strainsList.entities());
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
        this.setWidgetSaved(this.other, "contact_info", ...arguments);
        this.setState({
            other: commentsCb.details()
        });
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
            this.setOverviewData(
                MenuAndWidgets.getSetOfEntitiesFromWBAPIData(data.genestudied, data.genestudied, "WBGene"),
                MenuAndWidgets.getSetOfEntitiesFromWBAPIData(data.species, data.species, "Taxon ID "),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.structcorr, undefined));
            this.setGeneticsData(
                MenuAndWidgets.getSetOfEntitiesFromWBAPIData(data.variation, data.variation, ""),
                MenuAndWidgets.getSetOfEntitiesFromWBAPIData(data.strain, data.strain, undefined),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.alleleseqchange, data.seqchange),
                MenuAndWidgets.getTableValuesFromWBAPIData(data.othervariation, false),
                MenuAndWidgets.getTableValuesFromWBAPIData(data.otherstrain, false));
            this.setReagentData(
                MenuAndWidgets.getSetOfEntitiesFromWBAPIData(data.transgene, data.transgene, ""),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.antibody, undefined),
                MenuAndWidgets.getTableValuesFromWBAPIData(data.otherantibody, true),
                MenuAndWidgets.getTableValuesFromWBAPIData(data.othertransgene, false));
            this.setExpressionData(
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.otherexpr, data.otherexpr),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.siteaction, undefined),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.timeaction, undefined),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.rnaseq, undefined),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.additionalexpr, undefined));
            this.setInteractionsData(
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.geneint, data.geneint),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.geneprod, data.geneprod),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.genereg, data.genereg));
            this.setPhenotypeData(
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.newmutant, data.newmutant),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.rnai, data.rnai),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.overexpr, data.overexpr),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.invitro, undefined),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.chemphen, undefined),
                MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.envpheno, undefined));
            this.setDiseaseData(MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.humdis, undefined));
            this.setCommentsData(MenuAndWidgets.getCheckbxOrSingleFieldFromWBAPIData(data.comment, undefined));
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
            this.props.history.push(this.state.pages[newSelectedMenu - 1] + this.props.location.search);
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
        let overviewOk = this.state.completedSections["overview"] ? <Glyphicon glyph="ok"/> : false;
        let expressionOk = this.state.completedSections["expression"] ? <Glyphicon glyph="ok"/> : false;
        let geneticsOk = this.state.completedSections["genetics"] ? <Glyphicon glyph="ok"/>: false;
        let interactionsOk = this.state.completedSections["interactions"] ? <Glyphicon glyph="ok"/> : false;
        let phenotypesOk = this.state.completedSections["phenotypes"] ? <Glyphicon glyph="ok"/> : false;
        let reagentOk = this.state.completedSections["reagent"] ? <Glyphicon glyph="ok"/> : false;
        let diseaseOk = this.state.completedSections["disease"] ? <Glyphicon glyph="ok"/> : false;
        let contact_infoOk = this.state.completedSections["contact_info"] ? <Glyphicon glyph="ok"/> : false;
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
                                        <IndexLinkContainer to={"contact_info" + this.props.location.search} active={this.state.selectedMenu === 8}>
                                            <NavItem eventKey={8}>Comments and submit&nbsp;{contact_infoOk}</NavItem>
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