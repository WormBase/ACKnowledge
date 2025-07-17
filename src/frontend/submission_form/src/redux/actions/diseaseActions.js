export const SET_DISEASE = "SET_DISEASE";
export const TOGGLE_DISEASE = "TOGGLE_DISEASE";
export const SET_IS_DISEASE_SAVED_TO_DB = "SET_IS_DISEASE_SAVED_TO_DB";
export const ADD_DISEASE_NAME = "ADD_DISEASE_NAME";
export const REMOVE_DISEASE_NAME = "REMOVE_DISEASE_NAME";
export const SET_DISEASE_NAMES = "SET_DISEASE_NAMES";


export const setDisease = (checked, details) => ({
    type: SET_DISEASE,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleDisease = () => ({
    type: TOGGLE_DISEASE,
    payload: {}
});

export const setIsDiseaseSavedToDB = () => ({
    type: SET_IS_DISEASE_SAVED_TO_DB,
    payload: {}
});

export const addDiseaseName = (diseaseName) => ({
    type: ADD_DISEASE_NAME,
    payload: diseaseName
});

export const removeDiseaseName = (diseaseName) => ({
    type: REMOVE_DISEASE_NAME,
    payload: diseaseName
});

export const setDiseaseNames = (diseaseNames) => ({
    type: SET_DISEASE_NAMES,
    payload: diseaseNames
});