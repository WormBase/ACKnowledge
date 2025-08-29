import axios from 'axios';
import {setLoading, showDataSaved, showProgressSaved, unsetLoading} from "./displayActions";
import {setIsOverviewSavedToDB} from "./overviewActions";
import {setIsGeneticsSavedToDB} from "./geneticsActions";
import {setIsReagentSavedToDB} from "./reagentActions";
import {setIsExpressionSavedToDB} from "./expressionActions";
import {setIsPhenotypesSavedToDB} from "./phenotypesActions";
import {setIsInteractionsSavedToDB} from "./interactionsActions";
import {setIsDiseaseSavedToDB} from "./diseaseActions";
import {setIsCommentsSavedToDB} from "./commentsActions";
import {WIDGET} from "../../constants";
import {transformEntitiesIntoAfpString, getCheckboxDBVal} from "../../AFPValues";

export const SET_SELECTED_WIDGET = "SET_SELECTED_WIDGET";


export const saveWidgetData = (dataToSave, widget) => {
    return dispatch => {
        dispatch(setLoading());
        axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, dataToSave)
            .then(result => {
                switch (widget) {
                    case WIDGET.OVERVIEW:
                        dispatch(setIsOverviewSavedToDB());
                        break;
                    case WIDGET.GENETICS:
                        dispatch(setIsGeneticsSavedToDB());
                        break;
                    case WIDGET.REAGENT:
                        dispatch(setIsReagentSavedToDB());
                        break;
                    case WIDGET.EXPRESSION:
                        dispatch(setIsExpressionSavedToDB());
                        break;
                    case WIDGET.PHENOTYPES:
                        dispatch(setIsPhenotypesSavedToDB());
                        break;
                    case WIDGET.INTERACTIONS:
                        dispatch(setIsInteractionsSavedToDB());
                        break;
                    case WIDGET.DISEASE:
                        dispatch(setIsDiseaseSavedToDB());
                        break;
                    case WIDGET.COMMENTS:
                        dispatch(setIsCommentsSavedToDB());
                        break;
                }
                dispatch(showDataSaved(true, widget === WIDGET.COMMENTS));
            })
            .catch((error) => {
                dispatch(showDataSaved(false, false));
            }).finally(() => {
                dispatch(unsetLoading());
            });
    }
}

export const setSelectedWidget = (selectedWidget) => ({
  type: SET_SELECTED_WIDGET,
  payload: { selectedWidget }
})

export const saveWidgetDataSilently = (dataToSave, widget) => {
    return dispatch => {
        dispatch(setLoading());
        axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, dataToSave)
            .then(result => {
                switch (widget) {
                    case WIDGET.OVERVIEW:
                        dispatch(setIsOverviewSavedToDB());
                        break;
                    case WIDGET.GENETICS:
                        dispatch(setIsGeneticsSavedToDB());
                        break;
                    case WIDGET.REAGENT:
                        dispatch(setIsReagentSavedToDB());
                        break;
                    case WIDGET.EXPRESSION:
                        dispatch(setIsExpressionSavedToDB());
                        break;
                    case WIDGET.PHENOTYPES:
                        dispatch(setIsPhenotypesSavedToDB());
                        break;
                    case WIDGET.INTERACTIONS:
                        dispatch(setIsInteractionsSavedToDB());
                        break;
                    case WIDGET.DISEASE:
                        dispatch(setIsDiseaseSavedToDB());
                        break;
                    case WIDGET.COMMENTS:
                        dispatch(setIsCommentsSavedToDB());
                        break;
                }
                // Show simple progress saved modal without navigation
                dispatch(showProgressSaved());
            })
            .catch((error) => {
                dispatch(showDataSaved(false, false));
            }).finally(() => {
                dispatch(unsetLoading());
            });
    }
}

// Utility function to check if a widget has changes
const hasWidgetChanges = (widgetState) => {
    if (!widgetState) return false;
    // If saved to DB, no changes needed
    if (widgetState.isSavedToDB) return false;
    
    // Helper function to compare arrays
    const arraysEqual = (a = [], b = []) => {
        if (a.length !== b.length) return false;
        const setA = new Set(a);
        const setB = new Set(b);
        return setA.size === setB.size && [...setA].every(x => setB.has(x));
    };
    
    // Check for changes by comparing current state with saved state
    let hasChanges = false;
    
    // For Overview widget
    if (widgetState.genes && widgetState.savedGenes) {
        hasChanges = hasChanges || !arraysEqual(widgetState.genes.elements, widgetState.savedGenes);
    }
    if (widgetState.species && widgetState.savedSpecies) {
        hasChanges = hasChanges || !arraysEqual(widgetState.species.elements, widgetState.savedSpecies);
    }
    
    // For Genetics widget
    if (widgetState.alleles && widgetState.savedAlleles) {
        hasChanges = hasChanges || !arraysEqual(widgetState.alleles.elements, widgetState.savedAlleles);
    }
    if (widgetState.strains && widgetState.savedStrains) {
        hasChanges = hasChanges || !arraysEqual(widgetState.strains.elements, widgetState.savedStrains);
    }
    
    // For Reagent widget  
    if (widgetState.transgenes && widgetState.savedTransgenes) {
        hasChanges = hasChanges || !arraysEqual(widgetState.transgenes.elements, widgetState.savedTransgenes);
    }
    
    // For Disease widget
    if (widgetState.diseaseNames && widgetState.savedDiseaseNames) {
        hasChanges = hasChanges || !arraysEqual(widgetState.diseaseNames, widgetState.savedDiseaseNames);
    }
    
    // Check for other changes
    hasChanges = hasChanges ||
           (widgetState.addedGenes && widgetState.addedGenes.length > 0) ||
           (widgetState.addedSpecies && widgetState.addedSpecies.length > 0) ||
           (widgetState.addedAlleles && widgetState.addedAlleles.length > 0) ||
           (widgetState.addedStrains && widgetState.addedStrains.length > 0) ||
           (widgetState.newAlleles && widgetState.newAlleles.length > 0) ||
           (widgetState.newStrains && widgetState.newStrains.length > 0) ||
           (widgetState.addedTransgenes && widgetState.addedTransgenes.length > 0) ||
           (widgetState.addedDiseaseNames && widgetState.addedDiseaseNames.length > 0) ||
           (widgetState.newAntibodies && widgetState.newAntibodies.checked) ||
           (widgetState.comments && typeof widgetState.comments === 'string' && widgetState.comments.trim() !== '') ||
           // Check text fields for new entities
           (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.anatomical_term && typeof widgetState.otherExpressionEntities.anatomical_term === 'string' && widgetState.otherExpressionEntities.anatomical_term.trim() !== '') ||
           (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.life_stage && typeof widgetState.otherExpressionEntities.life_stage === 'string' && widgetState.otherExpressionEntities.life_stage.trim() !== '') ||
           (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.cellular_component && typeof widgetState.otherExpressionEntities.cellular_component === 'string' && widgetState.otherExpressionEntities.cellular_component.trim() !== '') ||
           (widgetState.otherPhenotypes && widgetState.otherPhenotypes.worm_phenotypes && typeof widgetState.otherPhenotypes.worm_phenotypes === 'string' && widgetState.otherPhenotypes.worm_phenotypes.trim() !== '') ||
           (widgetState.otherPhenotypes && widgetState.otherPhenotypes.phenotype_entity && typeof widgetState.otherPhenotypes.phenotype_entity === 'string' && widgetState.otherPhenotypes.phenotype_entity.trim() !== '') ||
           // Check checkboxes for various widgets
           (widgetState.geneModel && widgetState.geneModel.checked) ||
           (widgetState.sequenceChange && widgetState.sequenceChange.checked) ||
           (widgetState.expression && widgetState.expression.checked) ||
           (widgetState.siteOfAction && widgetState.siteOfAction.checked) ||
           (widgetState.timeOfAction && widgetState.timeOfAction.checked) ||
           (widgetState.additionalExpr && widgetState.additionalExpr.checked) ||
           (widgetState.geneint && widgetState.geneint.checked) ||
           (widgetState.geneprod && widgetState.geneprod.checked) ||
           (widgetState.genereg && widgetState.genereg.checked) ||
           (widgetState.allelePheno && widgetState.allelePheno.checked) ||
           (widgetState.rnaiPheno && widgetState.rnaiPheno.checked) ||
           (widgetState.overexprPheno && widgetState.overexprPheno.checked) ||
           (widgetState.chemPheno && widgetState.chemPheno.checked) ||
           (widgetState.envPheno && widgetState.envPheno.checked) ||
           (widgetState.enzymaticAct && widgetState.enzymaticAct.checked) ||
           (widgetState.othergenefunc && widgetState.othergenefunc.checked) ||
           (widgetState.disease && widgetState.disease.checked);
           
    return hasChanges;
};

export const saveAllUnsavedWidgets = () => {
    return (dispatch, getState) => {
        const state = getState();
        const paperPassword = state.paper.paperData.paperPasswd;
        const person = state.person.person;
        const promises = [];
        
        // Check and save Overview if it has changes
        if (hasWidgetChanges(state.overview)) {
            const overviewPayload = {
                gene_list: transformEntitiesIntoAfpString((state.overview.genes && state.overview.genes.elements) || [], "WBGene"),
                gene_model_update: getCheckboxDBVal((state.overview.geneModel && state.overview.geneModel.checked) || false, (state.overview.geneModel && state.overview.geneModel.details) || ""),
                species_list: transformEntitiesIntoAfpString((state.overview.species && state.overview.species.elements) || [], ""),
                other_species: JSON.stringify((state.overview.otherSpecies && state.overview.otherSpecies.elements) || []),
                person_id: "two" + person.personId,
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.OVERVIEW,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, overviewPayload)
            });
        }
        
        // Check and save Genetics if it has changes
        if (hasWidgetChanges(state.genetics)) {
            const geneticsPayload = {
                alleles_list: transformEntitiesIntoAfpString((state.genetics.alleles && state.genetics.alleles.elements) || [], ""),
                allele_seq_change: getCheckboxDBVal((state.genetics.sequenceChange && state.genetics.sequenceChange.checked) || false),
                other_alleles: JSON.stringify((state.genetics.otherAlleles && state.genetics.otherAlleles.elements) || []),
                strains_list: transformEntitiesIntoAfpString((state.genetics.strains && state.genetics.strains.elements) || [], ""),
                other_strains: JSON.stringify((state.genetics.otherStrains && state.genetics.otherStrains.elements) || []),
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.GENETICS,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, geneticsPayload)
            });
        }
        
        // Check and save Reagent if it has changes
        if (hasWidgetChanges(state.reagent)) {
            const reagentPayload = {
                transgenes_list: transformEntitiesIntoAfpString((state.reagent.transgenes && state.reagent.transgenes.elements) || [], ""),
                new_transgenes: JSON.stringify((state.reagent.otherTransgenes && state.reagent.otherTransgenes.elements) || []),
                new_antibody: getCheckboxDBVal((state.reagent.newAntibodies && state.reagent.newAntibodies.checked) || false, (state.reagent.newAntibodies && state.reagent.newAntibodies.details) || ""),
                other_antibodies: JSON.stringify((state.reagent.otherAntibodies && state.reagent.otherAntibodies.elements) || []),
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.REAGENT,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, reagentPayload)
            });
        }
        
        // Check and save Expression if it has changes
        if (hasWidgetChanges(state.expression)) {
            const expressionPayload = {
                anatomic_expr: getCheckboxDBVal((state.expression.expression && state.expression.expression.checked) || false, (state.expression.expression && state.expression.expression.details) || ""),
                site_action: getCheckboxDBVal((state.expression.siteOfAction && state.expression.siteOfAction.checked) || false, (state.expression.siteOfAction && state.expression.siteOfAction.details) || ""),
                time_action: getCheckboxDBVal((state.expression.timeOfAction && state.expression.timeOfAction.checked) || false, (state.expression.timeOfAction && state.expression.timeOfAction.details) || ""),
                additional_expr: getCheckboxDBVal((state.expression.additionalExpr && state.expression.additionalExpr.checked) || false, (state.expression.additionalExpr && state.expression.additionalExpr.details) || ""),
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.EXPRESSION,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, expressionPayload)
            });
        }
        
        // Check and save Interactions if it has changes
        if (hasWidgetChanges(state.interactions)) {
            const interactionsPayload = {
                gene_int: getCheckboxDBVal((state.interactions.geneint && state.interactions.geneint.checked) || false, (state.interactions.geneint && state.interactions.geneint.details) || ""),
                phys_int: getCheckboxDBVal((state.interactions.geneprod && state.interactions.geneprod.checked) || false, (state.interactions.geneprod && state.interactions.geneprod.details) || ""),
                gene_reg: getCheckboxDBVal((state.interactions.genereg && state.interactions.genereg.checked) || false, (state.interactions.genereg && state.interactions.genereg.details) || ""),
                person_id: "two" + person.personId,
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.INTERACTIONS,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, interactionsPayload)
            });
        }
        
        // Check and save Phenotypes if it has changes
        if (hasWidgetChanges(state.phenotypes)) {
            const phenotypesPayload = {
                allele_pheno: getCheckboxDBVal((state.phenotypes.allelePheno && state.phenotypes.allelePheno.checked) || false),
                rnai_pheno: getCheckboxDBVal((state.phenotypes.rnaiPheno && state.phenotypes.rnaiPheno.checked) || false),
                transover_pheno: getCheckboxDBVal((state.phenotypes.overexprPheno && state.phenotypes.overexprPheno.checked) || false),
                chemical: getCheckboxDBVal((state.phenotypes.chemPheno && state.phenotypes.chemPheno.checked) || false, (state.phenotypes.chemPheno && state.phenotypes.chemPheno.details) || ""),
                env: getCheckboxDBVal((state.phenotypes.envPheno && state.phenotypes.envPheno.checked) || false, (state.phenotypes.envPheno && state.phenotypes.envPheno.details) || ""),
                protein: getCheckboxDBVal((state.phenotypes.enzymaticAct && state.phenotypes.enzymaticAct.checked) || false, (state.phenotypes.enzymaticAct && state.phenotypes.enzymaticAct.details) || ""),
                othergenefunc: getCheckboxDBVal((state.phenotypes.othergenefunc && state.phenotypes.othergenefunc.checked) || false, (state.phenotypes.othergenefunc && state.phenotypes.othergenefunc.details) || ""),
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.PHENOTYPES,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, phenotypesPayload)
            });
        }
        
        // Check and save Disease if it has changes
        if (hasWidgetChanges(state.disease)) {
            // Don't pass "checked" as details - it's a legacy value that should be treated as empty
            const diseaseDetails = (state.disease.disease && state.disease.disease.details && state.disease.disease.details !== "checked") 
                ? state.disease.disease.details 
                : "";
            const diseasePayload = {
                disease: getCheckboxDBVal((state.disease.disease && state.disease.disease.checked) || false, diseaseDetails),
                disease_list: Array.isArray(state.disease.diseaseNames) ? state.disease.diseaseNames : [],
                person_id: "two" + person.personId,
                passwd: paperPassword
            };
            promises.push({
                widget: WIDGET.DISEASE,
                promise: axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, diseasePayload)
            });
        }
        
        // Comments section excluded - saving it triggers final submission
        
        if (promises.length === 0) {
            // All widgets are already saved
            dispatch(showProgressSaved());
            return;
        }
        
        dispatch(setLoading());
        
        // Execute all save promises
        Promise.all(promises.map(p => p.promise))
            .then(results => {
                // Update saved status for each widget
                promises.forEach(({widget}) => {
                    switch (widget) {
                        case WIDGET.OVERVIEW:
                            dispatch(setIsOverviewSavedToDB());
                            break;
                        case WIDGET.GENETICS:
                            dispatch(setIsGeneticsSavedToDB());
                            break;
                        case WIDGET.REAGENT:
                            dispatch(setIsReagentSavedToDB());
                            break;
                        case WIDGET.EXPRESSION:
                            dispatch(setIsExpressionSavedToDB());
                            break;
                        case WIDGET.PHENOTYPES:
                            dispatch(setIsPhenotypesSavedToDB());
                            break;
                        case WIDGET.INTERACTIONS:
                            dispatch(setIsInteractionsSavedToDB());
                            break;
                        case WIDGET.DISEASE:
                            dispatch(setIsDiseaseSavedToDB());
                            break;
                        case WIDGET.COMMENTS:
                            dispatch(setIsCommentsSavedToDB());
                            break;
                    }
                });
                dispatch(showProgressSaved());
            })
            .catch((error) => {
                dispatch(showDataSaved(false, false));
            })
            .finally(() => {
                dispatch(unsetLoading());
            });
    };
}