export const SET_ALLELES = "SET_ALLELES";
export const ADD_ALLELE = "ADD_ALLELE";
export const REMOVE_ALLELE = "REMOVE_ALLELE";
export const SET_STRAINS = "SET_STRAINS";
export const ADD_STRAIN = "ADD_STRAIN";
export const REMOVE_STRAIN = "REMOVE_STRAIN";
export const SET_SEQUENCE_CHANGE = "SET_SEQUENCE_CHANGE";
export const TOGGLE_SEQUENCE_CHANGE = "TOGGLE_SEQUENCE_CHANGE";
export const SET_IS_GENETICS_SAVED_TO_DB = "SET_IS_GENETICS_SAVED_TO_DB";
export const SET_OTHER_ALLELES = "SET_OTHER_ALLELES";
export const ADD_OTHER_ALLELE = "ADD_OTHER_ALLELE";
export const REMOVE_OTHER_ALLELE = "REMOVE_OTHER_ALLELE";
export const SET_OTHER_STRAINS = "SET_OTHER_STRAINS";
export const ADD_OTHER_STRAIN = "ADD_OTHER_STRAIN";
export const REMOVE_OTHER_STRAIN = "REMOVE_OTHER_STRAIN";
export const SET_STRAIN_ALREADY_PRESENT_ERROR = "SET_STRAIN_ALREADY_PRESENT_ERROR";


export const setAlleles = (elements, saved) => ({
    type: SET_ALLELES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addAllele = allele => ({
    type: ADD_ALLELE,
    payload: {
        allele
    }
});

export const removeAllele = allele => ({
    type: REMOVE_ALLELE,
    payload: {
        allele
    }
});

export const setStrains = (elements, saved) => ({
    type: SET_STRAINS,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addStrain = strain => ({
    type: ADD_STRAIN,
    payload: {
        strain
    }
});

export const removeStrain = strain => ({
    type: REMOVE_STRAIN,
    payload: {
        strain
    }
});

export const setSequenceChange = (checked, details) => ({
    type: SET_SEQUENCE_CHANGE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleSequenceChange = () => ({
    type: TOGGLE_SEQUENCE_CHANGE,
    payload: {}
});

export const setIsGeneticsSavedToDB = () => ({
    type: SET_IS_GENETICS_SAVED_TO_DB,
    payload: {}
});

export const setOtherAlleles = (elements, saved) => ({
    type: SET_OTHER_ALLELES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addOtherAllele = allele => ({
    type: ADD_OTHER_ALLELE,
    payload: {
        allele
    }
});

export const removeOtherAllele = allele => ({
    type: REMOVE_OTHER_ALLELE,
    payload: {
        allele
    }
});

export const setOtherStrains = (elements, saved) => ({
    type: SET_OTHER_STRAINS,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addOtherStrain = strain => ({
    type: ADD_OTHER_STRAIN,
    payload: {
        strain
    }
});

export const removeOtherStrain = strain => ({
    type: REMOVE_OTHER_STRAIN,
    payload: {
        strain
    }
});

export const setStrainAlreadyPresentError = errorMessage => ({
    type: SET_STRAIN_ALREADY_PRESENT_ERROR,
    payload: { errorMessage }
})
