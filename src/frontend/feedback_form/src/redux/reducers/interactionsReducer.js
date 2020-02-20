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
  geneprod: {
    checked: false,
    details: ''
  },
  genereg: {
    checked: false,
    details: ''
  },
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_GENETIC_INTERACTIONS: {
      return {
        ...state,
        geneint: action.payload,
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
      return {
        ...state,
        geneint: state.geneint,
        geneprod: action.payload,
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
      return {
        ...state,
        geneint: state.geneint,
        geneprod: state.geneprod,
        genereg: action.payload,
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
        geneprod: state.geneprod,
        genereg: state.genereg,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
