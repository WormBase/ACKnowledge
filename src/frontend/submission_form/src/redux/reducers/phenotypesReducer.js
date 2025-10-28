import {
  SET_ALLELE_PHENOTYPE,
  TOGGLE_ALLELE_PHENOTYPE,
  SET_RNAI_PHENOTYPE,
  TOGGLE_RNAI_PHENOTYPE,
  SET_CHEMICAL_PHENOTYPE,
  TOGGLE_CHEMICAL_PHENOTYPE,
  SET_ENVIRONMENTAL_PHENOTYPE,
  TOGGLE_ENVIRONMENTAL_PHENOTYPE,
  SET_ENZYMATIC_ACTIVITY,
  TOGGLE_ENZYMATIC_ACTIVITY,
  SET_IS_PHENOTYPES_SAVED_TO_DB,
  SET_OVEREXPR_PHENOTYPE,
  TOGGLE_OVEREXPR_PHENOTYPE,
  TOGGLE_OTHERGENEFUNC,
  SET_OTHERGENEFUNC
} from "../actions/phenotypesActions";


const initialState = {
  allelePheno: {
    checked: false,
    details: ''
  },
  savedAllelePheno: {
    checked: false,
    details: ''
  },
  rnaiPheno: {
    checked: false,
    details: ''
  },
  savedRnaiPheno: {
    checked: false,
    details: ''
  },
  overexprPheno: {
    checked: false,
    details: ''
  },
  savedOverexprPheno: {
    checked: false,
    details: ''
  },
  chemPheno: {
    checked: false,
    details: ''
  },
  savedChemPheno: {
    checked: false,
    details: ''
  },
  envPheno: {
    checked: false,
    details: ''
  },
  savedEnvPheno: {
    checked: false,
    details: ''
  },
  enzymaticAct: {
    checked: false,
    details: ''
  },
  savedEnzymaticAct: {
    checked: false,
    details: ''
  },
  othergenefunc: {
    checked: false,
    details: ''
  },
  savedOthergenefunc: {
    checked: false,
    details: ''
  },
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_ALLELE_PHENOTYPE: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedAllelePheno.checked && state.savedAllelePheno.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: action.payload,
        // Only set savedAllelePheno on initial load from API
        savedAllelePheno: isInitialLoad ? action.payload : state.savedAllelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_ALLELE_PHENOTYPE: {
      return {
        ...state,
        allelePheno: {checked: !state.allelePheno.checked, details: ''},
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case SET_RNAI_PHENOTYPE: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedRnaiPheno.checked && state.savedRnaiPheno.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: action.payload,
        // Only set savedRnaiPheno on initial load from API
        savedRnaiPheno: isInitialLoad ? action.payload : state.savedRnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_RNAI_PHENOTYPE: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: {checked: !state.rnaiPheno.checked, details: ''},
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case SET_OVEREXPR_PHENOTYPE: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedOverexprPheno.checked && state.savedOverexprPheno.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: action.payload,
        // Only set savedOverexprPheno on initial load from API
        savedOverexprPheno: isInitialLoad ? action.payload : state.savedOverexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_OVEREXPR_PHENOTYPE: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: {checked: !state.overexprPheno.checked, details: ''},
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case SET_CHEMICAL_PHENOTYPE: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedChemPheno.checked && state.savedChemPheno.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: action.payload,
        // Only set savedChemPheno on initial load from API
        savedChemPheno: isInitialLoad ? action.payload : state.savedChemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_CHEMICAL_PHENOTYPE: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: {checked: !state.chemPheno.checked, details: ''},
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case SET_ENVIRONMENTAL_PHENOTYPE: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedEnvPheno.checked && state.savedEnvPheno.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: action.payload,
        // Only set savedEnvPheno on initial load from API
        savedEnvPheno: isInitialLoad ? action.payload : state.savedEnvPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_ENVIRONMENTAL_PHENOTYPE: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: {checked: !state.envPheno.checked, details: ''},
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case SET_ENZYMATIC_ACTIVITY: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedEnzymaticAct.checked && state.savedEnzymaticAct.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: action.payload,
        // Only set savedEnzymaticAct on initial load from API
        savedEnzymaticAct: isInitialLoad ? action.payload : state.savedEnzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_ENZYMATIC_ACTIVITY: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: {checked: !state.enzymaticAct.checked, details: ''},
        othergenefunc: state.othergenefunc,
        isSavedToDB: false
      };
    }
    case SET_OTHERGENEFUNC: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedOthergenefunc.checked && state.savedOthergenefunc.details === '' && !state.isSavedToDB;
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: action.payload,
        // Only set savedOthergenefunc on initial load from API
        savedOthergenefunc: isInitialLoad ? action.payload : state.savedOthergenefunc,
        isSavedToDB: false
      };
    }
    case TOGGLE_OTHERGENEFUNC: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: {checked: !state.othergenefunc.checked, details: ''},
        isSavedToDB: false
      };
    }
    case SET_IS_PHENOTYPES_SAVED_TO_DB: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        savedAllelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        savedRnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        savedOverexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        savedChemPheno: state.chemPheno,
        envPheno: state.envPheno,
        savedEnvPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        savedEnzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        savedOthergenefunc: state.othergenefunc,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
