import { combineReducers } from "redux";
import person from "./personReducer";
import overview from "./overviewReducer";
import genetics from "./geneticsReducer";

export default combineReducers({person, overview, genetics});