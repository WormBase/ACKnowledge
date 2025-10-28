import {
    ADD_GENE,
    ADD_SPECIES,
    REMOVE_GENE,
    REMOVE_SPECIES,
    SET_GENE_MODEL,
    SET_SPECIES,
    SET_GENES, SET_IS_OVERVIEW_SAVED_TO_DB, TOGGLE_GENE_MODEL, SET_OTHER_SPECIES,
    SET_TFP_GENES, SET_TFP_SPECIES
} from "../actions/overviewActions";


const initialState = {
    genes: {
        elements: [],
        saved: false
    },
    geneModel: {
        checked: false,
        details: ''
    },
    savedGeneModel: {
        checked: false,
        details: ''
    },
    species: {
        elements: [],
        saved: false
    },
    addedGenes: [],
    addedSpecies: [],
    savedGenes: [],  // Track originally loaded genes
    savedSpecies: [], // Track originally loaded species
    tfpGenes: [],  // Store original tfp_ data for genes
    tfpSpecies: [], // Store original tfp_ data for species
    otherSpecies: {
        elements: [ { id: 1, name: "" } ],
        saved: false
    },
    isSavedToDB: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_GENES: {
            // Check if this is the initial load (savedGenes hasn't been set AND we're not saved to DB)
            const isInitialLoad = state.savedGenes.length === 0 && !state.isSavedToDB;
            // Ensure elements is always an array
            const elements = Array.isArray(action.payload.elements) 
                ? action.payload.elements 
                : Array.from(action.payload.elements || []);
            return {
                ...state,
                genes: {
                    ...action.payload,
                    elements: elements
                },
                // Only set savedGenes on initial load from API
                savedGenes: isInitialLoad ? elements : state.savedGenes,
                geneModel: state.geneModel,
                species: state.species,
                // Only reset addedGenes on initial load
                addedGenes: isInitialLoad ? [] : state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: false
            };
        }
        case ADD_GENE: {
            const newGenes = [...new Set([...state.genes.elements, action.payload.gene])];
            // Only add to addedGenes if it wasn't in the original saved list
            const wasOriginallyPresent = state.savedGenes.some(gene => gene.trim() === action.payload.gene.trim());
            const newAddedGenes = wasOriginallyPresent ? 
                state.addedGenes : 
                [...new Set([...state.addedGenes, action.payload.gene])];
            
            return {
                ...state,
                genes: {
                    elements: newGenes,
                    saved: false
                },
                addedGenes: newAddedGenes,
                addedSpecies: state.addedSpecies,
                geneModel: state.geneModel,
                species: state.species,
                isSavedToDB: false
            };
        }
        case REMOVE_GENE: {
            return {
                ...state,
                genes: {
                    elements: state.genes.elements.filter(element => element !== action.payload.gene),
                    saved: false
                },
                addedGenes: state.addedGenes.filter(gene => gene !== action.payload.gene),
                addedSpecies: state.addedSpecies,
                geneModel: state.geneModel,
                species: state.species,
                isSavedToDB: false
            };
        }
        case SET_SPECIES: {
            // Check if this is the initial load (savedSpecies hasn't been set AND we're not saved to DB)
            const isInitialLoad = state.savedSpecies.length === 0 && !state.isSavedToDB;
            // Ensure elements is always an array
            const elements = Array.isArray(action.payload.elements) 
                ? action.payload.elements 
                : Array.from(action.payload.elements || []);
            return {
                ...state,
                genes: state.genes,
                geneModel: state.geneModel,
                species: {
                    ...action.payload,
                    elements: elements
                },
                // Only set savedSpecies on initial load from API
                savedSpecies: isInitialLoad ? elements : state.savedSpecies,
                addedGenes: state.addedGenes,
                // Only reset addedSpecies on initial load
                addedSpecies: isInitialLoad ? [] : state.addedSpecies,
                isSavedToDB: false
            };
        }
        case ADD_SPECIES: {
            const newSpecies = [...new Set([...state.species.elements, action.payload.species])];
            // Only add to addedSpecies if it wasn't in the original saved list
            const wasOriginallyPresent = state.savedSpecies.some(species => species.trim() === action.payload.species.trim());
            const newAddedSpecies = wasOriginallyPresent ? 
                state.addedSpecies : 
                [...new Set([...state.addedSpecies, action.payload.species])];
            
            return {
                ...state,
                genes: state.genes,
                geneModel: state.geneModel,
                species: {
                    elements: newSpecies,
                    saved: false
                },
                addedSpecies: newAddedSpecies,
                addedGenes: state.addedGenes,
                isSavedToDB: false
            };
        }
        case REMOVE_SPECIES: {
            return {
                ...state,
                genes: state.genes,
                geneModel: state.geneModel,
                species: {
                    elements: state.species.elements.filter(element => element !== action.payload.species),
                    saved: false
                },
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies.filter(species => species !== action.payload.species),
                isSavedToDB: false
            };
        }
        case SET_GENE_MODEL: {
            // Check if this is the initial load
            const isInitialLoad = !state.savedGeneModel.checked && state.savedGeneModel.details === '' && !state.isSavedToDB;
            const newGeneModel = {checked: action.payload.checked, details: action.payload.details};
            return {
                ...state,
                genes: state.genes,
                geneModel: newGeneModel,
                // Only set savedGeneModel on initial load from API
                savedGeneModel: isInitialLoad ? newGeneModel : state.savedGeneModel,
                species: state.species,
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: false
            };
        }
        case TOGGLE_GENE_MODEL: {
            return {
                ...state,
                genes: state.genes,
                geneModel: {checked: !state.geneModel.checked, details: ''},
                species: state.species,
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: false
            };
        }
        case SET_IS_OVERVIEW_SAVED_TO_DB: {
            return {
                ...state,
                genes: state.genes,
                geneModel: state.geneModel,
                savedGeneModel: state.geneModel,
                species: state.species,
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: true
            };
        }
        case SET_OTHER_SPECIES: {
            return {
                ...state,
                otherSpecies: action.payload,
                isSavedToDB: false
            };
        }
        case SET_TFP_GENES: {
            return {
                ...state,
                tfpGenes: action.payload.genes
            };
        }
        case SET_TFP_SPECIES: {
            return {
                ...state,
                tfpSpecies: action.payload.species
            };
        }
        default:
            return state;
    }
}
