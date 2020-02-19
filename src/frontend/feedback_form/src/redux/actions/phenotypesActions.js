export const SET_ALLELE_PHENOTYPE = "SET_ALLELE_PHENOTYPE";
export const TOGGLE_ALLELE_PHENOTYPE = "TOGGLE_ALLELE_PHENOTYPE";
export const SET_RNAI_PHENOTYPE = "SET_RNAI_PHENOTYPE";
export const TOGGLE_RNAI_PHENOTYPE = "TOGGLE_RNAI_PHENOTYPE";
export const SET_OVEREXPR_PHENOTYPE = "SET_OVEREXPR_PHENOTYPE";
export const TOGGLE_OVEREXPR_PHENOTYPE = "TOGGLE_OVEREXPR_PHENOTYPE";
export const SET_CHEMICAL_PHENOTYPE = "SET_CHEMICAL_PHENOTYPE";
export const TOGGLE_CHEMICAL_PHENOTYPE = "TOGGLE_CHEMICAL_PHENOTYPE";
export const SET_ENVIRONMENTAL_PHENOTYPE = "SET_ENVIRONMENTAL_PHENOTYPE";
export const TOGGLE_ENVIRONMENTAL_PHENOTYPE = "TOGGLE_ENVIRONMENTAL_PHENOTYPE";
export const SET_ENZYMATIC_ACTIVITY = "SET_ENZYMATIC_ACTIVITY";
export const TOGGLE_ENZYMATIC_ACTIVITY = "TOGGLE_ENZYMATIC_ACTIVITY";
export const SET_IS_PHENOTYPES_SAVED_TO_DB = "SET_IS_PHENOTYPES_SAVED_TO_DB";


export const setAllelePhenotype = (checked, details) => ({
    type: SET_ALLELE_PHENOTYPE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleAllelePhenotype = () => ({
    type: TOGGLE_ALLELE_PHENOTYPE,
    payload: {}
});

export const setRnaiPhenotype = (checked, details) => ({
    type: SET_RNAI_PHENOTYPE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleRnaiPhenotype = () => ({
    type: TOGGLE_RNAI_PHENOTYPE,
    payload: {}
});

export const setOverexprPhenotype = (checked, details) => ({
    type: SET_OVEREXPR_PHENOTYPE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleOverexprPhenotype = () => ({
    type: TOGGLE_OVEREXPR_PHENOTYPE,
    payload: {}
});

export const setChemicalPhenotype = (checked, details) => ({
    type: SET_CHEMICAL_PHENOTYPE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleChemicalPhenotype = () => ({
    type: TOGGLE_CHEMICAL_PHENOTYPE,
    payload: {}
});

export const setEnvironmentalPhenotype = (checked, details) => ({
    type: SET_ENVIRONMENTAL_PHENOTYPE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleEnvironmentalPhenotype = () => ({
    type: TOGGLE_ENVIRONMENTAL_PHENOTYPE,
    payload: {}
});

export const setEnzymaticActivity = (checked, details) => ({
    type: SET_ENZYMATIC_ACTIVITY,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleEnzymaticActivity = () => ({
    type: TOGGLE_ENZYMATIC_ACTIVITY,
    payload: {}
});

export const setIsPhenotypesSavedToDB = () => ({
    type: SET_IS_PHENOTYPES_SAVED_TO_DB,
    payload: {}
});