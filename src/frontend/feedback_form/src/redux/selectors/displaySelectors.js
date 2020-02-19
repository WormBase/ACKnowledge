export const getDisplayState = store => store.display;

export const getSectionsNotCompleted = store => getDisplayState(store) ? getDisplayState(store).sectionsNotCompleted : false;

export const getDataSaved = store => getDisplayState(store) ? getDisplayState(store).dataSaved : {displayMessage: false, success: false};