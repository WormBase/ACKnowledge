import {
  SHOW_SECTIONS_NOT_COMPLETED,
  HIDE_SECTIONS_NOT_COMPLETED, SHOW_DATA_SAVED, HIDE_DATA_SAVED
} from "../actions/displayActions";


const initialState = {
  sectionsNotCompleted: false,
  dataSaved: {
    showMessage: false,
    success: false,
    lastWidget: false
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SHOW_SECTIONS_NOT_COMPLETED: {
      return {
        ...state,
        sectionsNotCompleted: true,
        dataSaved: state.dataSaved
      };
    }
    case HIDE_SECTIONS_NOT_COMPLETED: {
      return {
        ...state,
        sectionsNotCompleted: false,
        dataSaved: state.dataSaved
      };
    }
    case SHOW_DATA_SAVED: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: {showMessage: true, success: action.payload.success, lastWidget: action.payload.lastWidget}
      };
    }
    case HIDE_DATA_SAVED: {
      return {
        ...state,
        sectionsNotCompleted: state.sectionsNotCompleted,
        dataSaved: {showMessage: false, success: false, lastWidget: false}
      };
    }
    default:
      return state;
  }
}
