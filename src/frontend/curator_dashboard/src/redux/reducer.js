import {SET_SELECTED_PAPER_ID} from "./actions";

const initialState = {
  paperID: undefined
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SELECTED_PAPER_ID: {
      return {
        ...state,
        paperID: action.payload.paperID
      };
    }
    default:
      return state;
  }
}