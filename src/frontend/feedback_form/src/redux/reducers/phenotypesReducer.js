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
  rnaiPheno: {
    checked: false,
    details: ''
  },
  overexprPheno: {
    checked: false,
    details: ''
  },
  chemPheno: {
    checked: false,
    details: ''
  },
  envPheno: {
    checked: false,
    details: ''
  },
  enzymaticAct: {
    checked: false,
    details: ''
  },
  othergenefunc: {
    checked: false,
    details: ''
  },
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_ALLELE_PHENOTYPE: {
      return {
        ...state,
        allelePheno: action.payload,
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
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: action.payload,
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
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: action.payload,
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
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: action.payload,
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
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: action.payload,
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
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: action.payload,
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
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: action.payload,
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
        othergenefunc: {checked: !state.enzymaticAct.checked, details: ''},
        isSavedToDB: false
      };
    }
    case SET_IS_PHENOTYPES_SAVED_TO_DB: {
      return {
        ...state,
        allelePheno: state.allelePheno,
        rnaiPheno: state.rnaiPheno,
        overexprPheno: state.overexprPheno,
        chemPheno: state.chemPheno,
        envPheno: state.envPheno,
        enzymaticAct: state.enzymaticAct,
        othergenefunc: state.othergenefunc,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
