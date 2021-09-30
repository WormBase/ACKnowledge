import {
  SET_DISEASE,
  TOGGLE_DISEASE,
  SET_IS_DISEASE_SAVED_TO_DB
} from "../actions/diseaseActions";


const initialState = {
  disease: {
    checked: false,
    details: ''
  },
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
    default:
      return state;
  }
}
