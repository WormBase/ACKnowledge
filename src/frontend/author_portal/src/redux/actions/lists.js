import axios from "axios";

export const SET_TOKEN_IS_VALIDATING = "SET_TOKEN_IS_VALIDATING";
export const SET_LIST_ERROR = "SET_LIST_ERROR";
export const SET_TOKEN_VALIDITY = "SET_TOKEN_VALIDITY";
export const SET_LIST = "SET_LIST";
export const SET_LIST_IS_LOADING = "SET_LIST_IS_LOADING";

export const listTypes = Object.freeze({
    WAITING: 1,
    PARTIAL: 2,
    SUBMITTED: 3
});

const baseEndpoint = process.env.REACT_APP_API_DB_READ_ENDPOINT;

const listEndPoints = {};
listEndPoints[listTypes.WAITING] = baseEndpoint + "/get_processed_papers";
listEndPoints[listTypes.PARTIAL] = baseEndpoint + "/get_partial_papers";
listEndPoints[listTypes.SUBMITTED] = baseEndpoint + "/get_submitted_papers";


export const fetchPaperList = (listType, offset, limit, token) => {
    return dispatch => {
        dispatch(setListIsLoading(listType));
        axios.post(listEndPoints[listType], {from: offset, count: limit, passwd: token})
            .then(res => {
                dispatch(setList(listType, res.data["list_ids"], res.data["total_num_ids"]));
            })
            .catch((err) => {
                dispatch(setError(err));
            });
    }
}

export const validateToken = (token) => {
    return dispatch => {
        if (token !== undefined && token !== "undefined") {
            dispatch(setTokenIsValidating());
            axios.post(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/is_token_valid", {passwd: token})
                .then(res => {
                    if (res.data["token_valid"] === "True") {
                        dispatch(setTokenValidity(true));
                    }
                })
                .catch((err) => {
                    dispatch(setError(err));
                });
        } else {
            dispatch(setTokenValidity(false));
        }
    }
}

export const setTokenIsValidating = () => ({
    type: SET_TOKEN_IS_VALIDATING
});

export const setError = (error) => ({
    type: SET_LIST_ERROR,
    payload: { error }
});

export const setTokenValidity = (validity) => ({
    type: SET_TOKEN_VALIDITY,
    payload: { validity }
});

export const setList = (listType, elements, totNumElements) => ({
    type: SET_LIST,
    payload: {listType: listType, elements: elements, totNumElements: totNumElements}
});

export const setListIsLoading = (listType) => ({
    type: SET_LIST_IS_LOADING,
    payload: {listType}
});