import axios from "axios";

export const SET_TOKEN_IS_VALIDATING = "SET_TOKEN_IS_VALIDATING";
export const SET_LIST_ERROR = "SET_LIST_ERROR";
export const SET_TOKEN_VALIDITY = "SET_TOKEN_VALIDITY";
export const SET_TOT_NUM_ELEMENTS = "SET_TOT_NUM_ELEMENTS";


export const listTypes = Object.freeze({
    WAITING: 1,
    PARTIAL: 2,
    SUBMITTED: 3
});

const baseEndpoint = process.env.REACT_APP_API_DB_READ_ENDPOINT;

export const listEndPoints = {};
listEndPoints[listTypes.WAITING] = baseEndpoint + "/get_processed_papers";
listEndPoints[listTypes.PARTIAL] = baseEndpoint + "/get_partial_papers";
listEndPoints[listTypes.SUBMITTED] = baseEndpoint + "/get_submitted_papers";


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

export const setTotNumElements = (listType, totNumElements) => ({
    type: SET_TOT_NUM_ELEMENTS,
    payload: {listType: listType, totNumElements: totNumElements}
});
