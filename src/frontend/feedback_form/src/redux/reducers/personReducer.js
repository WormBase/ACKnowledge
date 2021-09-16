import { SET_PERSON } from "../actions/personActions";


const initialState = {
  person: {
    name: '',
    personId: undefined,
    isLoading: false,
    loadError: null
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_PERSON: {
      return {
        ...state,
        person: {
          name: action.payload.name,
          personId: action.payload.personId
        }
      };
    }
    default:
      return state;
  }
}
