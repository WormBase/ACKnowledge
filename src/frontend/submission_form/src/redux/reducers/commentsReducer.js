import {
  SET_COMMENTS,
  SET_IS_COMMENTS_SAVED_TO_DB
} from "../actions/commentsActions";


const initialState = {
  comments: '',
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_COMMENTS: {
      return {
        ...state,
        comments: action.payload.details,
        isSavedToDB: false
      };
    }
    case SET_IS_COMMENTS_SAVED_TO_DB: {
      return {
        ...state,
        comments: state.comments,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
