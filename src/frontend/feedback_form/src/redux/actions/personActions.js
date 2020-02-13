export const SET_PERSON = "SET_PERSON";

export function setPerson(name, personId) {
    return {
        type: SET_PERSON,
        payload: {
            name: name,
            personId: personId
        }
    }
}