import {
  SET_DISEASE,
  TOGGLE_DISEASE,
  SET_IS_DISEASE_SAVED_TO_DB,
  ADD_DISEASE_NAME,
  REMOVE_DISEASE_NAME,
  SET_DISEASE_NAMES
} from "../actions/diseaseActions";


const initialState = {
  disease: {
    checked: false,
    details: ''
  },
  diseaseNames: [],
  addedDiseaseNames: [],
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_DISEASE: {
      return {
        ...state,
        disease: action.payload,
        isSavedToDB: false
      };
    }
    case TOGGLE_DISEASE: {
      return {
        ...state,
        disease: {checked: !state.disease.checked, details: ''},
        isSavedToDB: false
      };
    }
    case SET_IS_DISEASE_SAVED_TO_DB: {
      return {
        ...state,
        disease: state.disease,
        isSavedToDB: true
      };
    }
    case ADD_DISEASE_NAME: {
      return {
        ...state,
        diseaseNames: [...state.diseaseNames, action.payload],
        addedDiseaseNames: [...state.addedDiseaseNames, action.payload],
        isSavedToDB: false
      };
    }
    case REMOVE_DISEASE_NAME: {
      return {
        ...state,
        diseaseNames: state.diseaseNames.filter(name => name !== action.payload),
        addedDiseaseNames: state.addedDiseaseNames.filter(name => name !== action.payload),
        isSavedToDB: false
      };
    }
    case SET_DISEASE_NAMES: {
      return {
        ...state,
        diseaseNames: action.payload,
        isSavedToDB: false
      };
    }
    default:
      return state;
  }
}
