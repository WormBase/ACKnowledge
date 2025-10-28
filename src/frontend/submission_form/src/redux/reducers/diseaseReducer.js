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
  savedDisease: {
    checked: false,
    details: ''
  },
  diseaseNames: [],
  addedDiseaseNames: [],
  savedDiseaseNames: [], // Track originally loaded diseases
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_DISEASE: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedDisease.checked && state.savedDisease.details === '' && !state.isSavedToDB;
      return {
        ...state,
        disease: action.payload,
        // Only set savedDisease on initial load from API
        savedDisease: isInitialLoad ? action.payload : state.savedDisease,
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
        savedDisease: state.disease,
        isSavedToDB: true
      };
    }
    case ADD_DISEASE_NAME: {
      const newDiseaseNames = [...state.diseaseNames, action.payload];
      // Only add to addedDiseaseNames if it wasn't in the original saved list
      const wasOriginallyPresent = state.savedDiseaseNames.some(name => name.trim() === action.payload.trim());
      const newAddedDiseaseNames = wasOriginallyPresent ? 
        state.addedDiseaseNames : 
        [...state.addedDiseaseNames, action.payload];
      
      return {
        ...state,
        diseaseNames: newDiseaseNames,
        addedDiseaseNames: newAddedDiseaseNames,
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
        diseaseNames: Array.isArray(action.payload) ? action.payload : [],
        savedDiseaseNames: Array.isArray(action.payload) ? action.payload : [], // Store as saved baseline
        addedDiseaseNames: [], // Reset added diseases when loading from API
        isSavedToDB: false
      };
    }
    default:
      return state;
  }
}
