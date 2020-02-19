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
  REMOVE_OTHER_STRAIN
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
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_ALLELES: {
      return {
        ...state,
        alleles: action.payload,
        strains: state.strains,
        sequenceChange: state.sequenceChange,
        otherAlleles: state.otherAlleles,
        otherStrains: state.otherStrains,
        isSavedToDB: false
      };
    }
    case ADD_ALLELE: {
      return {
        ...state,
        alleles: {
          elements: [...state.alleles.elements, action.payload.allele],
          saved: false
        },
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
        strains: state.strains,
        sequenceChange: state.sequenceChange,
        otherAlleles: state.otherAlleles,
        otherStrains: state.otherStrains,
        isSavedToDB: false
      };
    }
    case SET_STRAINS: {
      return {
        ...state,
        alleles: state.alleles,
        strains: action.payload,
        sequenceChange: state.sequenceChange,
        otherAlleles: state.otherAlleles,
        otherStrains: state.otherStrains,
        isSavedToDB: false
      };
    }
    case ADD_STRAIN: {
      return {
        ...state,
        alleles: state.alleles,
        strains: {
          elements: [...state.strains.elements, action.payload.strain],
          saved: false
        },
        sequenceChange: state.sequenceChange,
        otherAlleles: state.otherAlleles,
        otherStrains: state.otherStrains,
        isSavedToDB: false
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
        sequenceChange: state.sequenceChange,
        otherAlleles: state.otherAlleles,
        otherStrains: state.otherStrains,
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
        isSavedToDB: false
      };
    }
    case ADD_OTHER_ALLELE: {
      return {
        ...state,
        alleles: state.alleles,
        strains: state.strains,
        sequenceChange: state.sequenceChange,
        otherAlleles: {elements: [...state.otherAlleles.elements, action.payload.allele], saved: false},
        otherStrains: state.otherStrains,
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
        otherStrains: {elements: [...state.otherStrains.elements, action.payload.strain], saved: false},
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
        isSavedToDB: state.isSavedToDB
      };
    }
    default:
      return state;
  }
}
