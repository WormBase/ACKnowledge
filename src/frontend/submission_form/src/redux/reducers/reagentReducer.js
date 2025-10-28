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
    REMOVE_OTHER_ANTIBODY,
    SET_TFP_TRANSGENES
} from "../actions/reagentActions";


const initialState = {
    transgenes: {
        elements: [],
        saved: false
    },
    addedTransgenes: [],
    savedTransgenes: [],  // Track originally loaded transgenes
    tfpTransgenes: [],  // Store original tfp_ data for transgenes
    newAntibodies: {
        checked: false,
        details: ''
    },
    savedNewAntibodies: {
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
            // Ensure savedTransgenes is an array
            const currentSavedTransgenes = Array.isArray(state.savedTransgenes) ? state.savedTransgenes : [];
            // Check if this is the initial load (savedTransgenes hasn't been set AND we're not saved to DB)
            const isInitialLoad = currentSavedTransgenes.length === 0 && !state.isSavedToDB;
            // Ensure elements is always an array
            const elements = Array.isArray(action.payload.elements) 
                ? action.payload.elements 
                : Array.from(action.payload.elements || []);
            return {
                ...state,
                transgenes: {
                    ...action.payload,
                    elements: elements
                },
                // Only set savedTransgenes on initial load from API
                savedTransgenes: isInitialLoad ? elements : currentSavedTransgenes,
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                // Only reset addedTransgenes on initial load
                addedTransgenes: isInitialLoad ? [] : state.addedTransgenes,
                isSavedToDB: false
            };
        }
        case ADD_TRANSGENE: {
            const newTransgenes = [...new Set([...state.transgenes.elements, action.payload.transgene])];
            // Ensure savedTransgenes is an array before using .some()
            const savedTransgenesArray = Array.isArray(state.savedTransgenes) ? state.savedTransgenes : [];
            // Only add to addedTransgenes if it wasn't in the original saved list
            const wasOriginallyPresent = savedTransgenesArray.some(transgene => transgene.trim() === action.payload.transgene.trim());
            const newAddedTransgenes = wasOriginallyPresent ? 
                state.addedTransgenes : 
                [...new Set([...state.addedTransgenes, action.payload.transgene])];
            
            return {
                ...state,
                transgenes: {
                    elements: newTransgenes,
                    saved: false
                },
                addedTransgenes: newAddedTransgenes,
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
                addedTransgenes: state.addedTransgenes.filter(transgene => transgene !== action.payload.transgene),
                newAntibodies: state.newAntibodies,
                otherTransgenes: state.otherTransgenes,
                otherAntibodies: state.otherAntibodies,
                isSavedToDB: false
            };
        }
        case SET_NEW_ANTIBODIES: {
            // Check if this is the initial load
            const isInitialLoad = !state.savedNewAntibodies.checked && state.savedNewAntibodies.details === '' && !state.isSavedToDB;
            const newAntibodies = {checked: action.payload.checked, details: action.payload.details};
            return {
                ...state,
                transgenes: state.transgenes,
                newAntibodies: newAntibodies,
                // Only set savedNewAntibodies on initial load from API
                savedNewAntibodies: isInitialLoad ? newAntibodies : state.savedNewAntibodies,
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
                savedNewAntibodies: state.newAntibodies,
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
        case SET_TFP_TRANSGENES: {
            return {
                ...state,
                tfpTransgenes: action.payload.transgenes
            };
        }
        default:
            return state;
    }
}
