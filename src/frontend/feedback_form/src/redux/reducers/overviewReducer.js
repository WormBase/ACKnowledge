import {
  ADD_GENE,
  ADD_SPECIES,
  REMOVE_GENE,
  REMOVE_SPECIES,
  SET_GENE_MODEL,
  SET_SPECIES,
  SET_GENES} from "../overviewActionTypes";


const initialState = {
  genes: {
    entities: [],
    saved: false
  },
  geneModel: {
    checked: false,
    details: ''
  },
  species: {
    entities: [],
    saved: false
  },
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_GENES: {
      return {
        ...state,
        genes: action.payload,
        geneModel: state.geneModel,
        species: state.species
      };
    }
    case ADD_GENE: {
      return {
        ...state,
        genes: {
          elements: [...state.genes, action.payload.gene],
          saved: state.genes.saved
        },
        geneModel: state.geneModel,
        species: state.species
      };
    }
    case REMOVE_GENE: {
      return {
        ...state,
        genes: {
          elements: state.genes.filter(element => element !== action.payload.gene),
          saved: state.genes.saved
        },
        geneModel: state.geneModel,
        species: state.species
      };
    }
    case SET_SPECIES: {
      return {
        ...state,
        genes: state.genes,
        geneModel: state.geneModel,
        species: action.payload
      };
    }
    case ADD_SPECIES: {
      return {
        ...state,
        genes: state.genes,
        geneModel: state.geneModel,
        species: {
          elements: [...state.species, action.payload.species],
          saved: state.species.saved
        }
      };
    }
    case REMOVE_SPECIES: {
      return {
        ...state,
        genes: state.genes,
        geneModel: state.geneModel,
        species: {
          elements: state.species.filter(element => element !== action.payload.species),
          saved: state.species.saved
        }
      };
    }
    case SET_GENE_MODEL:
      return {
        ...state,
        genes: state.genes,
        geneModel: {checked: action.payload.checked, details: action.payload.details},
        species: state.species
      };
    default:
      return state;
  }
}
