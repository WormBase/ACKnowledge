import {ADD_ELEMENT, REMOVE_ELEMENT, SEARCH_ELEMENT} from "./actionTypes";

export const addElement = content => ({
    type: ADD_ELEMENT,
    payload: {
        content
    }
});

export const removeElement = content => ({
    type: REMOVE_ELEMENT,
    payload: {
        content
    }
});

export const searchElement = searchString => ({
    type: SEARCH_ELEMENT,
    payload: {
        searchString
    }
});