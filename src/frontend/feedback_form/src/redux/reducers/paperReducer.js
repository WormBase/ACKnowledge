import {FETCH_PAPER_DATA_ERROR, FETCH_PAPER_DATA_REQUEST, FETCH_PAPER_DATA_SUCCESS} from '../actions/paperActions';

const initialState = {
    paperData: {
        isLoading: false,
        loadError: null
    }
};

export default function(state = initialState, action) {
    switch (action.type) {
        case FETCH_PAPER_DATA_REQUEST: {
            return {
                ...state,
                paperData: {
                    isLoading: true,
                    loadError: false
                }
            }
        }
        case FETCH_PAPER_DATA_SUCCESS: {
            return {
                ...state,
                paperData: {
                    isLoading: false,
                    loadError: null
                }
            }
        }
        case FETCH_PAPER_DATA_ERROR: {
            return {
                ...state,
                paperData: {
                    isLoading: false,
                    loadError: action.payload.error
                }
            };
        }
        default:
            return state;
    }
}
