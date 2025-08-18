export const SET_TRANSGENES = "SET_TRANSGENES";
export const ADD_TRANSGENE = "ADD_TRANSGENE";
export const REMOVE_TRANSGENE = "REMOVE_TRANSGENE";
export const SET_NEW_ANTIBODIES = "SET_NEW_ANTIBODIES";
export const TOGGLE_NEW_ANTIBODIES = "TOGGLE_NEW_ANTIBODIES";
export const SET_IS_REAGENT_SAVED_TO_DB = "SET_IS_REAGENT_SAVED_TO_DB";
export const SET_TFP_TRANSGENES = "SET_TFP_TRANSGENES";
export const SET_OTHER_TRANSGENES = "SET_OTHER_TRANSGENES";
export const ADD_OTHER_TRANSGENE = "ADD_OTHER_TRANSGENE";
export const REMOVE_OTHER_TRANSGENE = "REMOVE_OTHER_TRANSGENE";
export const SET_OTHER_ANTIBODIES = "SET_OTHER_ANTIBODIES";
export const ADD_OTHER_ANTIBODY = "ADD_OTHER_ANTIBODY";
export const REMOVE_OTHER_ANTIBODY = "REMOVE_OTHER_ANTIBODY";

export const setTransgenes = (elements, saved) => ({
    type: SET_TRANSGENES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addTransgene = transgene => ({
    type: ADD_TRANSGENE,
    payload: {
        transgene
    }
});

export const removeTransgene = transgene => ({
    type: REMOVE_TRANSGENE,
    payload: {
        transgene
    }
});

export const setNewAntibodies = (checked, details) => ({
    type: SET_NEW_ANTIBODIES,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleNewAntibodies = () => ({
    type: TOGGLE_NEW_ANTIBODIES,
    payload: {}
});

export const setIsReagentSavedToDB = () => ({
    type: SET_IS_REAGENT_SAVED_TO_DB,
    payload: {}
});

export const setOtherTransgenes = (elements, saved) => ({
    type: SET_OTHER_TRANSGENES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addOtherTransgene = transgene => ({
    type: ADD_OTHER_TRANSGENE,
    payload: {
        transgene
    }
});

export const removeOtherTransgene = transgene => ({
    type: REMOVE_OTHER_TRANSGENE,
    payload: {
        transgene
    }
});

export const setOtherAntibodies = (elements, saved) => ({
    type: SET_OTHER_ANTIBODIES,
    payload: {
        elements: elements,
        saved: saved
    }
});

export const addOtherAntibody = antibody => ({
    type: ADD_OTHER_ANTIBODY,
    payload: {
        antibody
    }
});

export const removeOtherAntibody = antibody => ({
    type: REMOVE_OTHER_ANTIBODY,
    payload: {
        antibody
    }
});

export const setTfpTransgenes = (transgenes) => ({
    type: SET_TFP_TRANSGENES,
    payload: {
        transgenes: transgenes
    }
});
