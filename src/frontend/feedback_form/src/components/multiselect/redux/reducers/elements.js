import {ADD_ELEMENT, REMOVE_ELEMENT, SEARCH_ELEMENT} from "../actionTypes";

const initialState = {
  allIds: [],
  byIds: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_ELEMENT: {
      const { id, content } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, id],
        byIds: {
          ...state.byIds,
          [id]: {
            content
          }
        }
      };
    }
    case REMOVE_ELEMENT: {
      return state.filter(element => element.id !== action.id);
    }
    default:
      return state;
  }
}
