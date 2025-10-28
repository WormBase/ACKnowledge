import {
  SET_GENETIC_INTERACTIONS,
  TOGGLE_GENETIC_INTERACTIONS,
  SET_PHYSICAL_INTERACTIONS,
  TOGGLE_PHYSICAL_INTERACTIONS,
  SET_REGULATORY_INTERACTIONS,
  TOGGLE_REGULATORY_INTERACTIONS,
  SET_IS_INTERACTIONS_SAVED_TO_DB
} from "../actions/interactionsActions";


const initialState = {
  geneint: {
    checked: false,
    details: ''
  },
  savedGeneint: {
    checked: false,
    details: ''
  },
  geneprod: {
    checked: false,
    details: ''
  },
  savedGeneprod: {
    checked: false,
    details: ''
  },
  genereg: {
    checked: false,
    details: ''
  },
  savedGenereg: {
    checked: false,
    details: ''
  },
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_GENETIC_INTERACTIONS: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedGeneint.checked && state.savedGeneint.details === '' && !state.isSavedToDB;
      return {
        ...state,
        geneint: action.payload,
        // Only set savedGeneint on initial load from API
        savedGeneint: isInitialLoad ? action.payload : state.savedGeneint,
        geneprod: state.geneprod,
        genereg: state.genereg,
        isSavedToDB: false
      };
    }
    case TOGGLE_GENETIC_INTERACTIONS: {
      return {
        ...state,
        geneint: {checked: !state.geneint.checked, details: ''},
        geneprod: state.geneprod,
        genereg: state.genereg,
        isSavedToDB: false
      };
    }
    case SET_PHYSICAL_INTERACTIONS: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedGeneprod.checked && state.savedGeneprod.details === '' && !state.isSavedToDB;
      return {
        ...state,
        geneint: state.geneint,
        geneprod: action.payload,
        // Only set savedGeneprod on initial load from API
        savedGeneprod: isInitialLoad ? action.payload : state.savedGeneprod,
        genereg: state.genereg,
        isSavedToDB: false
      };
    }
    case TOGGLE_PHYSICAL_INTERACTIONS: {
      return {
        ...state,
        geneint: state.geneint,
        geneprod: {checked: !state.geneprod.checked, details: ''},
        genereg: state.genereg,
        isSavedToDB: false
      };
    }
    case SET_REGULATORY_INTERACTIONS: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedGenereg.checked && state.savedGenereg.details === '' && !state.isSavedToDB;
      return {
        ...state,
        geneint: state.geneint,
        geneprod: state.geneprod,
        genereg: action.payload,
        // Only set savedGenereg on initial load from API
        savedGenereg: isInitialLoad ? action.payload : state.savedGenereg,
        isSavedToDB: false
      };
    }
    case TOGGLE_REGULATORY_INTERACTIONS: {
      return {
        ...state,
        geneint: state.geneint,
        geneprod: state.geneprod,
        genereg: {checked: !state.genereg.checked, details: ''},
        isSavedToDB: false
      };
    }
    case SET_IS_INTERACTIONS_SAVED_TO_DB: {
      return {
        ...state,
        geneint: state.geneint,
        savedGeneint: state.geneint,
        geneprod: state.geneprod,
        savedGeneprod: state.geneprod,
        genereg: state.genereg,
        savedGenereg: state.genereg,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
