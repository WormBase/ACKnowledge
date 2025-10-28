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
  savedExpression: {
    checked: false,
    details: ''
  },
  siteOfAction: {
    checked: false,
    details: ''
  },
  savedSiteOfAction: {
    checked: false,
    details: ''
  },
  timeOfAction: {
    checked: false,
    details: ''
  },
  savedTimeOfAction: {
    checked: false,
    details: ''
  },
  additionalExpr: {
    checked: false,
    details: ''
  },
  savedAdditionalExpr: {
    checked: false,
    details: ''
  },
  isSavedToDB: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_EXPRESSION: {
      // Check if this is the initial load
      const isInitialLoad = !state.savedExpression.checked && state.savedExpression.details === '' && !state.isSavedToDB;
      return {
        ...state,
        expression: action.payload,
        // Only set savedExpression on initial load from API
        savedExpression: isInitialLoad ? action.payload : state.savedExpression,
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
      // Check if this is the initial load
      const isInitialLoad = !state.savedSiteOfAction.checked && state.savedSiteOfAction.details === '' && !state.isSavedToDB;
      return {
        ...state,
        expression: state.expression,
        siteOfAction: action.payload,
        // Only set savedSiteOfAction on initial load from API
        savedSiteOfAction: isInitialLoad ? action.payload : state.savedSiteOfAction,
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
      // Check if this is the initial load
      const isInitialLoad = !state.savedTimeOfAction.checked && state.savedTimeOfAction.details === '' && !state.isSavedToDB;
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: action.payload,
        // Only set savedTimeOfAction on initial load from API
        savedTimeOfAction: isInitialLoad ? action.payload : state.savedTimeOfAction,
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
      // Check if this is the initial load
      const isInitialLoad = !state.savedAdditionalExpr.checked && state.savedAdditionalExpr.details === '' && !state.isSavedToDB;
      return {
        ...state,
        expression: state.expression,
        siteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        additionalExpr: action.payload,
        // Only set savedAdditionalExpr on initial load from API
        savedAdditionalExpr: isInitialLoad ? action.payload : state.savedAdditionalExpr,
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
        savedExpression: state.expression,
        siteOfAction: state.siteOfAction,
        savedSiteOfAction: state.siteOfAction,
        timeOfAction: state.timeOfAction,
        savedTimeOfAction: state.timeOfAction,
        additionalExpr: state.additionalExpr,
        savedAdditionalExpr: state.additionalExpr,
        isSavedToDB: true
      };
    }
    default:
      return state;
  }
}
