import {
    SET_ALLELES,
    ADD_ALLELE,
    REMOVE_ALLELE,
    SET_STRAINS,
    ADD_STRAIN,
    REMOVE_STRAIN,
    SET_SEQUENCE_CHANGE,
    TOGGLE_SEQUENCE_CHANGE,
    SET_IS_GENETICS_SAVED_TO_DB,
    SET_OTHER_ALLELES,
    ADD_OTHER_ALLELE,
    REMOVE_OTHER_ALLELE,
    SET_OTHER_STRAINS,
    ADD_OTHER_STRAIN,
    REMOVE_OTHER_STRAIN, SET_STRAIN_ALREADY_PRESENT_ERROR
} from "../actions/geneticsActions";


const initialState = {
    alleles: {
        elements: [],
        saved: false
    },
    strains: {
        elements: [],
        saved: false
    },
    addedAlleles: [],
    addedStrains: [],
    savedAlleles: [],  // Track originally loaded alleles
    savedStrains: [],  // Track originally loaded strains
    sequenceChange: {
        checked: false,
        details: ''
    },
    otherAlleles: {
        elements: [ { id: 1, name: "" } ],
        saved: false
    },
    otherStrains: {
        elements: [ { id: 1, name: "" } ],
        saved: false
    },
    isSavedToDB: false,
    strainAlreadyPresentError: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_ALLELES: {
            // Check if this is the initial load (savedAlleles hasn't been set AND we're not saved to DB)
            const isInitialLoad = state.savedAlleles.length === 0 && !state.isSavedToDB;
            return {
                ...state,
                alleles: action.payload,
                // Only set savedAlleles on initial load from API
                savedAlleles: isInitialLoad ? (action.payload.elements || []) : state.savedAlleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                // Only reset addedAlleles on initial load
                addedAlleles: isInitialLoad ? [] : state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case ADD_ALLELE: {
            const newAlleles = [...new Set([...state.alleles.elements, action.payload.allele])];
            // Only add to addedAlleles if it wasn't in the original saved list
            const wasOriginallyPresent = state.savedAlleles.some(allele => allele.trim() === action.payload.allele.trim());
            const newAddedAlleles = wasOriginallyPresent ? 
                state.addedAlleles : 
                [...new Set([...state.addedAlleles, action.payload.allele])];
            
            return {
                ...state,
                alleles: {
                    elements: newAlleles,
                    saved: false
                },
                addedAlleles: newAddedAlleles,
                addedStrains: state.addedStrains,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                isSavedToDB: false
            };
        }
        case REMOVE_ALLELE: {
            return {
                ...state,
                alleles: {
                    elements: state.alleles.elements.filter(element => element !== action.payload.allele),
                    saved: false
                },
                addedAlleles: state.addedAlleles.filter(allele => allele !== action.payload.allele),
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case SET_STRAINS: {
            // Check if this is the initial load (savedStrains hasn't been set AND we're not saved to DB)
            const isInitialLoad = state.savedStrains.length === 0 && !state.isSavedToDB;
            return {
                ...state,
                alleles: state.alleles,
                strains: action.payload,
                // Only set savedStrains on initial load from API
                savedStrains: isInitialLoad ? (action.payload.elements || []) : state.savedStrains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                // Only reset addedStrains on initial load
                addedStrains: isInitialLoad ? [] : state.addedStrains,
                isSavedToDB: false
            };
        }
        case ADD_STRAIN: {
            let newStrainsArr = [...new Set([...state.strains.elements, action.payload.strain])];
            let currStrainsNamesOnlySet =  new Set(state.strains.elements.map(strain => strain.split(" ( ")[0]));
            let newStrainNameOnly = action.payload.strain.split(" ( ")[0];
            let newStrainAlreadyPresentError = state.strainAlreadyPresentError;
            if (currStrainsNamesOnlySet.has(newStrainNameOnly)) {
                newStrainsArr = [...new Set([...[...state.strains.elements].filter(e => e !== newStrainNameOnly), action.payload.strain])];
                newStrainAlreadyPresentError = true
            }
            
            // Only add to addedStrains if it wasn't in the original saved list
            const wasOriginallyPresent = state.savedStrains.some(strain => strain.trim() === action.payload.strain.trim());
            const newAddedStrains = wasOriginallyPresent ? 
                state.addedStrains : 
                [...new Set([...state.addedStrains, action.payload.strain])];
            
            return {
                ...state,
                alleles: state.alleles,
                strains: {
                    elements: newStrainsArr,
                    saved: false
                },
                addedStrains: newAddedStrains,
                addedAlleles: state.addedAlleles,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                isSavedToDB: false,
                strainAlreadyPresentError: newStrainAlreadyPresentError
            };
        }
        case REMOVE_STRAIN: {
            return {
                ...state,
                alleles: state.alleles,
                strains: {
                    elements: state.strains.elements.filter(element => element !== action.payload.strain),
                    saved: false
                },
                addedStrains: state.addedStrains.filter(strain => strain !== action.payload.strain),
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                isSavedToDB: false
            };
        }
        case SET_SEQUENCE_CHANGE: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: {checked: action.payload.checked, details: action.payload.details},
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case TOGGLE_SEQUENCE_CHANGE: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: {checked: !state.sequenceChange.checked, details: ''},
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case SET_IS_GENETICS_SAVED_TO_DB: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: true
            };
        }
        case SET_OTHER_ALLELES: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: action.payload,
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case ADD_OTHER_ALLELE: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: {elements: [...new Set([...state.otherAlleles.elements, action.payload.allele])], saved: false},
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case REMOVE_OTHER_ALLELE: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: {
                    elements: state.otherAlleles.elements.filter(element => element !== action.payload.allele),
                    saved: false},
                otherStrains: state.otherStrains,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case SET_OTHER_STRAINS: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: action.payload,
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case ADD_OTHER_STRAIN: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: {elements: [...new Set([...state.otherStrains.elements, action.payload.strain])], saved: false},
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: false
            };
        }
        case REMOVE_OTHER_STRAIN: {
            return {
                ...state,
                alleles: state.alleles,
                strains: state.strains,
                sequenceChange: state.sequenceChange,
                otherAlleles: state.otherAlleles,
                otherStrains: {
                    elements: state.otherStrains.elements.filter(element => element !== action.payload.strain),
                    saved: false
                },
                addedAlleles: state.addedAlleles,
                addedStrains: state.addedStrains,
                isSavedToDB: state.isSavedToDB
            };
        }
        case SET_STRAIN_ALREADY_PRESENT_ERROR: {
            return {
                ...state,
                strainAlreadyPresentError: action.payload.errorMessage
            }
        }
        default:
            return state;
    }
}
