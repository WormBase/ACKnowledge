import axios from "axios";

export const SET_LIST_IS_LOADING = "SET_LIST_IS_LOADING";
export const SET_LIST_ERROR = "SET_LIST_ERROR";
export const SET_TOKEN_VALIDITY = "SET_TOKEN_VALIDITY";
export const SET_NUM_PAPERS_IN_LIST = "SET_NUM_PAPERS_IN_LIST";

export const listTypes = Object.freeze({
    WAITING: 1,
    PARTIAL: 2,
    SUBMITTED: 3
});


export const validateTokenAndGetCounts = (token) => {
    return dispatch => {
        if (token !== undefined && token !== "undefined") {
            dispatch(setIsLoading());
            axios.post(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/is_token_valid", {passwd: token})
                .then(res => {
                    if (res.data["token_valid"] === "True") {
                        dispatch(setTokenValidity(true));
                        dispatch(getTitleBadgeNum("get_processed_papers", listTypes.WAITING, token));
                        dispatch(getTitleBadgeNum("get_submitted_papers", listTypes.SUBMITTED, token));
                        dispatch(getTitleBadgeNum("get_partial_papers", listTypes.PARTIAL, token));
                    } else {
                        dispatch(setTokenValidity(false));
                    }
                })
                .catch((err) => {
                    dispatch(setError(err));
                });
        }
    }
}

const getTitleBadgeNum = (endpoint, listType, token) => {
    return dispatch => {
        axios.post(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/" + endpoint, {from: 0, count: 1, passwd: token})
            .then(res => {
                dispatch(setNumPapersInList(listType, res.data["total_num_ids"]));
            })
            .catch((err) => {
                dispatch(setError(err));
            });
    }
}

export const setIsLoading = () => ({
    type: SET_LIST_IS_LOADING
});

export const setError = (error) => ({
    type: SET_LIST_ERROR,
    payload: { error }
});

export const setTokenValidity = (validity) => ({
    type: SET_TOKEN_VALIDITY,
    payload: { validity }
});

export const setNumPapersInList = (list, num) => ({
    type: SET_NUM_PAPERS_IN_LIST,
    payload: {list: list, num: num}
});