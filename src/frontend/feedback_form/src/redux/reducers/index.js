import { combineReducers } from "redux";
import person from "./personReducer";
import overview from "./overviewReducer";
import genetics from "./geneticsReducer";
import reagent from "./reagentReducer";
import expression from "./expressionReducer";
import interactions from "./interactionsReducer";
import phenotypes from "./phenotypesReducer";
import disease from "./diseaseReducer";
import comments from "./commentsReducer";
import display from "./displayReducer";
import paper from "./paperReducer";
import widget from "./widgetReducer";

export default combineReducers({person, overview, genetics, reagent, expression, interactions, phenotypes, disease, comments, display, paper, widget});