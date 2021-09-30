import {
    SET_SELECTED_WIDGET
} from "../actions/widgetActions";
import {MENU_INDEX, WIDGET} from "../../constants";


const initialState = {
    selectedWidget: MENU_INDEX[WIDGET.OVERVIEW]
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_SELECTED_WIDGET: {
            return {
                ...state,
                selectedWidget: action.payload.selectedWidget
            };
        }
        default:
            return state;
    }
}
