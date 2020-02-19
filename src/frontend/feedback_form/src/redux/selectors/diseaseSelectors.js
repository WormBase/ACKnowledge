export const getDiseaseState = store => store.disease;

export const getDisease = store => getDiseaseState(store) ? getDiseaseState(store).disease : {checked: false, details: ''};

export const isDiseaseSavedToDB = store => getDiseaseState(store) ? getDiseaseState(store).isSavedToDB : false;