import { combineReducers } from "redux";
import overview from "./overviewReducer";
import person from "./personReducer";

export default combineReducers({overview, person});