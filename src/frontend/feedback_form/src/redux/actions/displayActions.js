export const SHOW_SECTIONS_NOT_COMPLETED = "SHOW_SECTIONS_NOT_COMPLETED";
export const HIDE_SECTIONS_NOT_COMPLETED = "HIDE_SECTIONS_NOT_COMPLETED";
export const SHOW_DATA_SAVED = "SHOW_DATA_SAVED";
export const HIDE_DATA_SAVED = "SHOW_DATA_SAVED";

export const showSectionsNotCompleted = () => ({
    type: SHOW_SECTIONS_NOT_COMPLETED,
    payload: {}
});

export const hideSectionsNotCompleted = () => ({
    type: HIDE_SECTIONS_NOT_COMPLETED,
    payload: {}
});

export const showDataSaved = (success, lastWidget) => ({
    type: SHOW_DATA_SAVED,
    payload: {
        success: success,
        lastWidget: lastWidget
    }
});

export const hideDataSaved = () => ({
    type: HIDE_DATA_SAVED,
    payload: {}
});