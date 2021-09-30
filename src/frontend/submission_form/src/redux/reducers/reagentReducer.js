import {
    SET_TRANSGENES,
    ADD_TRANSGENE,
    REMOVE_TRANSGENE,
    SET_NEW_ANTIBODIES,
    TOGGLE_NEW_ANTIBODIES,
    SET_IS_REAGENT_SAVED_TO_DB,
    SET_OTHER_TRANSGENES,
    ADD_OTHER_TRANSGENE,
    REMOVE_OTHER_TRANSGENE,
    SET_OTHER_ANTIBODIES,
    ADD_OTHER_ANTIBODY,
    REMOVE_OTHER_ANTIBODY
} from "../actions/reagentActions";


const initialState = {
    transgenes: {
        elements: [],
        saved: false
    },
    addedTransgenes: [],
    newAntibodies: {
        checked: false,
        details: ''
    },
    otherTransgenes: {
        elements: [ { id: 1, name: "" } ],
        saved: false
    },
    otherAntibodies: {
        elements: [ { id: 1, name: "", publicationId: "" } ],
        saved: false
    },
    isSavedToDB: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_TRANSGENES: {
            return {
                ...state,
                transgenes: action.payload,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case ADD_TRANSGENE: {
            return {
                ...state,
                transgenes: {
                    elements: [...new Set([...state.transgenes.elements, action.payload.transgene])],
                    saved: false
                },
                addedTransgenes: [...new Set([...state.addedTransgenes, action.payload.transgene])],
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                isSavedToDB: false
            };
        }
        case REMOVE_TRANSGENE: {
            return {
                ...state,
                transgenes: {
                    elements: state.transgenes.elements.filter(element => element !== action.payload.transgene),
                    saved: false
                },
                addedTransgenes: state.addedTransgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                isSavedToDB: false
            };
        }
        case SET_NEW_ANTIBODIES: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: {checked: action.payload.checked, details: action.payload.details},
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case TOGGLE_NEW_ANTIBODIES: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: {checked: !state.newAntibodies.checked, details: ''},
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case SET_IS_REAGENT_SAVED_TO_DB: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: true
            };
        }
        case SET_OTHER_TRANSGENES: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: action.payload,
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case ADD_OTHER_TRANSGENE: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: {elements: [...new Set([...state.otherTransgenes.elements, action.payload.transgene])], saved: false},
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case REMOVE_OTHER_TRANSGENE: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: {
                    elements: state.otherTransgenes.elements.filter(element => element !== action.payload.transgene),
                    saved: false},
                otherAntibodies: state.otherAntibodies,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case SET_OTHER_ANTIBODIES: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: action.payload,
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case ADD_OTHER_ANTIBODY: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: {elements: [...new Set([...state.otherAntibodies.elements, action.payload.antibody])], saved: false},
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case REMOVE_OTHER_ANTIBODY: {
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: {
                    elements: state.otherAntibodies.elements.filter(element => element !== action.payload.antibody),
                    saved: false},
                addedTransgenes: state.addedTransgenes,
                isSavedToDB: false
            };
        }
        default:
            return state;
    }
}
