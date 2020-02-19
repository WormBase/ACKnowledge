export const SET_EXPRESSION = "SET_EXPRESSION";
export const TOGGLE_EXPRESSION = "TOGGLE_EXPRESSION";
export const SET_SITE_OF_ACTION = "SET_SITE_OF_ACTION";
export const TOGGLE_SITE_OF_ACTION = "TOGGLE_SITE_OF_ACTION";
export const SET_TIME_OF_ACTION = "SET_TIME_OF_ACTION";
export const TOGGLE_TIME_OF_ACTION = "TOGGLE_TIME_OF_ACTION";
export const SET_RNASEQ = "SET_RNASEQ";
export const TOGGLE_RNASEQ = "TOGGLE_RNASEQ";
export const SET_ADDITIONAL_EXPR = "SET_ADDITIONAL_EXPR";
export const SET_IS_EXPRESSION_SAVED_TO_DB = "SET_IS_EXPRESSION_SAVED_TO_DB";


export const setExpression = (checked, details) => ({
    type: SET_EXPRESSION,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleExpression = () => ({
    type: TOGGLE_EXPRESSION,
    payload: {}
});

export const setSiteOfAction = (checked, details) => ({
    type: SET_SITE_OF_ACTION,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleSiteOfAction = () => ({
    type: TOGGLE_SITE_OF_ACTION,
    payload: {}
});

export const setTimeOfAction = (checked, details) => ({
    type: SET_TIME_OF_ACTION,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleTimeOfAction = () => ({
    type: TOGGLE_TIME_OF_ACTION,
    payload: {}
});

export const setRnaseq = (checked, details) => ({
    type: SET_RNASEQ,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleRnaseq = () => ({
    type: TOGGLE_RNASEQ,
    payload: {}
});

export const setAdditionalExpr = details => ({
    type: SET_ADDITIONAL_EXPR,
    payload: {
        details
    }
});

export const setIsExpressionSavedToDB = () => ({
    type: SET_IS_EXPRESSION_SAVED_TO_DB,
    payload: {}
});