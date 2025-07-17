export const SHOW_SECTIONS_NOT_COMPLETED = "SHOW_SECTIONS_NOT_COMPLETED";
export const HIDE_SECTIONS_NOT_COMPLETED = "HIDE_SECTIONS_NOT_COMPLETED";
export const SHOW_DATA_SAVED = "SHOW_DATA_SAVED";
export const HIDE_DATA_SAVED = "HIDE_DATA_SAVED";
export const SHOW_PROGRESS_SAVED = "SHOW_PROGRESS_SAVED";
export const HIDE_PROGRESS_SAVED = "HIDE_PROGRESS_SAVED";
export const SET_LOADING = "SET_LOADING";
export const UNSET_LOADING = "UNSET_LOADING";
export const SHOW_DATA_FETCH_ERROR = "SHOW_DATA_FETCH_ERROR";
export const HIDE_DATA_FETCH_ERROR = "HIDE_DATA_FETCH_ERROR";

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

export const setLoading = () => ({
    type: SET_LOADING,
    payload: {}
});

export const unsetLoading = () => ({
    type: UNSET_LOADING,
    payload: {}
});

export const showDataFetchError = () => ({
    type: SHOW_DATA_FETCH_ERROR,
    payload: {}
});

export const hideDataFetchError = () => ({
    type: HIDE_DATA_FETCH_ERROR,
    payload: {}
});

export const showProgressSaved = () => ({
    type: SHOW_PROGRESS_SAVED,
    payload: {}
});

export const hideProgressSaved = () => ({
    type: HIDE_PROGRESS_SAVED,
    payload: {}
});