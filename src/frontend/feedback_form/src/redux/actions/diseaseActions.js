export const SET_DISEASE = "SET_DISEASE";
export const TOGGLE_DISEASE = "TOGGLE_DISEASE";
export const SET_IS_DISEASE_SAVED_TO_DB = "SET_IS_DISEASE_SAVED_TO_DB";


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