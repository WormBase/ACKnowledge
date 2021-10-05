import { combineReducers } from "redux";
import login from "./login";
import lists from "./lists";

export default combineReducers({login, lists});