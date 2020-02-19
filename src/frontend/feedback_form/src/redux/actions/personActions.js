export const SET_PERSON = "SET_PERSON";

export const setPerson = (name, personId) => ({
    type: SET_PERSON,
    payload: {
        name: name,
        personId: personId
    }
});