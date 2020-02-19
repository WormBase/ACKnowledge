import { combineReducers } from "redux";
import person from "./personReducer";
import overview from "./overviewReducer";
import genetics from "./geneticsReducer";
import reagent from "./reagentReducer";
import expression from "./expressionReducer";
import interactions from "./interactionsReducer";

export default combineReducers({person, overview, genetics, reagent, expression, interactions});