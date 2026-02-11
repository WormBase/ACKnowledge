import axios from 'axios';
import {showDataFetchError} from "./displayActions";

export const FETCH_PERSON_DATA_REQUEST = "FETCH_PERSON_DATA_REQUEST";
export const FETCH_PERSON_DATA_SUCCESS = "FETCH_PERSON_DATA_SUCCESS";
export const FETCH_PERSON_DATA_ERROR = "FETCH_PERSON_DATA_ERROR";

export const SET_PERSON = "SET_PERSON";


export const fetchPersonData = (passwd, personId) => {
    return dispatch => {
        dispatch(fetchPersonDataRequest());
        axios.post(process.env.REACT_APP_API_DB_READ_ENDPOINT, {person_id: personId, passwd: passwd})
            .then(result => {
                if (result.data.error === "user_not_found") {
                    dispatch(setPerson('', undefined));
                } else {
                    dispatch(setPerson(result.data.fullname, result.data.person_id));
                }
                dispatch(fetchPersonDataSuccess());
            })
            .catch(error => {
                dispatch(fetchPersonDataError(error));
                dispatch(showDataFetchError());
            });
    }
}

export const fetchPersonDataRequest = () => ({
    type: FETCH_PERSON_DATA_REQUEST
});

export const fetchPersonDataSuccess = () => ({
    type: FETCH_PERSON_DATA_SUCCESS
});

export const fetchPersonDataError = (error) => ({
   type: FETCH_PERSON_DATA_ERROR,
   payload: {error}
});

export const setPerson = (name, personId) => ({
    type: SET_PERSON,
    payload: {
        name: name,
        personId: personId
    }
});