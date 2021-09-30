import {
    ADD_GENE,
    ADD_SPECIES,
    REMOVE_GENE,
    REMOVE_SPECIES,
    SET_GENE_MODEL,
    SET_SPECIES,
    SET_GENES, SET_IS_OVERVIEW_SAVED_TO_DB, TOGGLE_GENE_MODEL
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
    species: {
        elements: [],
        saved: false
    },
    addedGenes: [],
    addedSpecies: [],
    isSavedToDB: false
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_GENES: {
            return {
                ...state,
                genes: action.payload,
                geneModel: state.geneModel,
                species: state.species,
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: false
            };
        }
        case ADD_GENE: {
            return {
                ...state,
                genes: {
                    elements: [...new Set([...state.genes.elements, action.payload.gene])],
                    saved: false
                },
                addedGenes: [...new Set([...state.addedGenes, action.payload.gene])],
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
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                geneModel: state.geneModel,
                species: state.species,
                isSavedToDB: false
            };
        }
        case SET_SPECIES: {
            return {
                ...state,
                genes: state.genes,
                geneModel: state.geneModel,
                species: action.payload,
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: false
            };
        }
        case ADD_SPECIES: {
            return {
                ...state,
                genes: state.genes,
                geneModel: state.geneModel,
                species: {
                    elements: [...new Set([...state.species.elements, action.payload.species])],
                    saved: false
                },
                addedSpecies: [...new Set([...state.addedSpecies, action.payload.species])],
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
                addedSpecies: state.addedSpecies,
                isSavedToDB: false
            };
        }
        case SET_GENE_MODEL: {
            return {
                ...state,
                genes: state.genes,
                geneModel: {checked: action.payload.checked, details: action.payload.details},
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
                species: state.species,
                addedGenes: state.addedGenes,
                addedSpecies: state.addedSpecies,
                isSavedToDB: true
            };
        }
        default:
            return state;
    }
}
