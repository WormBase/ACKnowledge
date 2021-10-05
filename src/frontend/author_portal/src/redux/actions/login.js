import axios from "axios";

export const SET_LOGIN_IS_LOADING = "SET_LOGIN_IS_LOADING";
export const SET_TOKEN = "SET_TOKEN";
export const SET_LOGIN_ERROR = "SET_LOGIN_ERROR";
export const SET_LOGIN_EMAIL_SENT = "SET_LOGIN_EMAIL_SENT";


export const logIn = (emailAddress) => {
    return dispatch => {
        if (process.env.REACT_APP_REQUEST_AUTH === "true") {
            dispatch(requestEmailLink(emailAddress));
        } else {
            dispatch(fetchToken(emailAddress));
        }
    }
}

export const fetchToken = (emailAddress) => {
    return dispatch => {
        dispatch(setIsLoading());
        if (emailAddress !== undefined && emailAddress !== "undefined") {
            axios.post(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/get_token_from_email",
                { email: emailAddress })
                .then(res => {
                    dispatch(setToken(res.data.token))
                })
                .catch(err => {
                    dispatch(setError("can't fetch access token"))
                });
        } else {
            dispatch(setError("email address is not valid"));
        }
    }
}

export const requestEmailLink = (emailAddress) => {
    return dispatch => {
        if (emailAddress !== undefined && emailAddress !== "undefined" && emailAddress !== "") {
            dispatch(setIsLoading());
            axios.post(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/send_link", { email: emailAddress })
                .then(res => {
                    dispatch(setLoginEmailSent());
                })
                .catch((err) => {
                    dispatch(setError("can't send email link"));
                });
        }
    }
}

export const setIsLoading = () => ({
    type: SET_LOGIN_IS_LOADING
});

export const setToken = (token) => ({
    type: SET_TOKEN,
    payload: { token }
});

export const setError = (error) => ({
    type: SET_LOGIN_ERROR,
    payload: { error }
});

export const setLoginEmailSent = () => ({
    type: SET_LOGIN_EMAIL_SENT
});