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


export function setAlleles(elements, saved) {
    return {
        type: SET_ALLELES,
        payload: {
            elements: elements,
            saved: saved
        }
    }
}

export const addAllele = allele => ({
    type: ADD_ALLELE,
    payload: {
        allele
    }
});

export function removeAllele(allele) {
    return {
        type: REMOVE_ALLELE,
        payload: {
            allele
        }
    }
}

export function setStrains(elements, saved) {
   return {
       type: SET_STRAINS,
       payload: {
           elements: elements,
           saved: saved
       }
   }
}

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

export function setSequenceChange(checked, details) {
    return {
        type: SET_SEQUENCE_CHANGE,
        payload: {
            checked: checked,
            details: details
        }
    };
}

export function toggleSequenceChange() {
    return {
        type: TOGGLE_SEQUENCE_CHANGE,
        payload: {}
    };
}

export const setIsGeneticsSavedToDB = () => ({
    type: SET_IS_GENETICS_SAVED_TO_DB,
    payload: {}
});

export function setOtherAlleles(elements, saved) {
   return {
       type: SET_OTHER_ALLELES,
       payload: {
           elements: elements,
           saved: saved
       }
   }
}

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

export function setOtherStrains(elements, saved) {
   return {
       type: SET_OTHER_STRAINS,
       payload: {
           elements: elements,
           saved: saved
       }
   }
}

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