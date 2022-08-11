export const SET_GENES = "SET_GENES";
export const ADD_GENE = "ADD_GENE";
export const REMOVE_GENE = "REMOVE_GENE";
export const SET_SPECIES = "SET_SPECIES";
export const ADD_SPECIES = "ADD_SPECIES";
export const REMOVE_SPECIES = "REMOVE_SPECIES";
export const SET_GENE_MODEL = "SET_GENE_MODEL";
export const TOGGLE_GENE_MODEL = "TOGGLE_GENE_MODEL";
export const SET_IS_OVERVIEW_SAVED_TO_DB = "SET_IS_SAVED_TO_DB";
export const SET_OTHER_SPECIES = "SET_OTHER_SPECIES";


export const setGenes = (elements, saved) => ({
    type: SET_GENES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addGene = gene => ({
    type: ADD_GENE,
    payload: {
        gene
    }
});

export const removeGene = gene => ({
    type: REMOVE_GENE,
    payload: {
        gene
    }
});

export const setSpecies = (elements, saved) => ({
    type: SET_SPECIES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addSpecies = species => ({
    type: ADD_SPECIES,
    payload: {
        species
    }
});

export const removeSpecies = species => ({
    type: REMOVE_SPECIES,
    payload: {
        species
    }
});

export const setGeneModel = (checked, details) => ({
    type: SET_GENE_MODEL,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleGeneModel = () => ({
    type: TOGGLE_GENE_MODEL,
    payload: {}
});

export const setIsOverviewSavedToDB = () => ({
    type: SET_IS_OVERVIEW_SAVED_TO_DB,
    payload: {}
});

export const setOtherSpecies = (elements, saved) => ({
    type: SET_OTHER_SPECIES,
    payload: {
        elements: elements,
        saved: saved
    }
});