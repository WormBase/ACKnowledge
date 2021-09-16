import {
    FETCH_PAPER_DATA_ERROR,
    FETCH_PAPER_DATA_REQUEST,
    FETCH_PAPER_DATA_SUCCESS,
    STORE_PAPER_INFO
} from '../actions/paperActions';

const initialState = {
    paperData: {
        isLoading: false,
        loadError: null,
        paperId: undefined,
        paperPasswd: undefined
    }
};

export default function(state = initialState, action) {
    switch (action.type) {
        case FETCH_PAPER_DATA_REQUEST: {
            return {
                ...state,
                paperData: {
                    isLoading: true,
                    loadError: false,
                    paperId: state.paperData.paperId,
                    paperPasswd: state.paperData.paperPasswd
                }
            }
        }
        case FETCH_PAPER_DATA_SUCCESS: {
            return {
                ...state,
                paperData: {
                    isLoading: false,
                    loadError: null,
                    paperId: state.paperData.paperId,
                    paperPasswd: state.paperData.paperPasswd
                }
            }
        }
        case FETCH_PAPER_DATA_ERROR: {
            return {
                ...state,
                paperData: {
                    isLoading: false,
                    loadError: action.payload.error,
                    paperId: state.paperData.paperId,
                    paperPasswd: state.paperData.paperPasswd
                }
            };
        }
        case STORE_PAPER_INFO: {
            return {
                ...state,
                paperData: {
                    isLoading: state.paperData.isLoading,
                    loadError: state.paperData.loadError,
                    paperId: action.payload.paperId,
                    paperPasswd: action.payload.paperPasswd
                }
            };
        }
        default:
            return state;
    }
}
