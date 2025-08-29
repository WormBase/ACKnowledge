import {
  SET_EXPRESSION,
  TOGGLE_EXPRESSION,
  SET_SITE_OF_ACTION,
  TOGGLE_SITE_OF_ACTION,
  SET_TIME_OF_ACTION,
  TOGGLE_TIME_OF_ACTION,
  SET_ADDITIONAL_EXPR,
  TOGGLE_ADDITIONAL_EXPR,
  SET_IS_EXPRESSION_SAVED_TO_DB
} from "../actions/expressionActions";


const initialState = {
  expression: {
    checked: false,
    details: ''
  },
  siteOfAction: {
    checked: false,
    details: ''
  },
  timeOfAction: {
    checked: false,
    details: ''
  },
  additionalExpr: {
    checked: false,
    details: ''
  },
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_EXPRESSION: {
      return {
        ...state,
        expression: action.payload,
        siteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        additionalExpr: state.additionalExpr,
        isSavedToDB: false
      };
    }
    case TOGGLE_EXPRESSION: {
      return {
        ...state,
        expression: {checked: !state.expression.checked, details: ''},
        siteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        additionalExpr: state.additionalExpr,
        isSavedToDB: false
      };
    }
    case SET_SITE_OF_ACTION: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: action.payload,
        timeOfAction: state.timeOfAction,
        additionalExpr: state.additionalExpr,
        isSavedToDB: false
      };
    }
    case TOGGLE_SITE_OF_ACTION: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: {checked: !state.siteOfAction.checked, details: ''},
        timeOfAction: state.timeOfAction,
        additionalExpr: state.additionalExpr,
        isSavedToDB: false
      };
    }
    case SET_TIME_OF_ACTION: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: action.payload,
        additionalExpr: state.additionalExpr,
        isSavedToDB: false
      };
    }
    case TOGGLE_TIME_OF_ACTION: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: {checked: !state.timeOfAction.checked, details: ''},
        additionalExpr: state.additionalExpr,
        isSavedToDB: false
      };
    }
    case SET_ADDITIONAL_EXPR: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        additionalExpr: action.payload,
        isSavedToDB: false
      };
    }
    case TOGGLE_ADDITIONAL_EXPR: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        additionalExpr: {checked: !state.additionalExpr.checked, details: ''},
        isSavedToDB: false
      };
    }
    case SET_IS_EXPRESSION_SAVED_TO_DB: {
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        additionalExpr: state.additionalExpr,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
