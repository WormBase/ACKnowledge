export const getExpressionState = store => store.expression;

export const getExpression = store => getExpressionState(store) ? getExpressionState(store).expression : {checked: false, details: ''};

export const getSiteOfAction = store => getExpressionState(store) ? getExpressionState(store).siteOfAction : {checked: false, details: ''};

export const getTimeOfAction = store => getExpressionState(store) ? getExpressionState(store).timeOfAction : {checked: false, details: ''};

export const getRnaseq = store => getExpressionState(store) ? getExpressionState(store).rnaseq : {checked: false, details: ''};

export const getAdditionalExpr = store => getExpressionState(store) ? getExpressionState(store).additional_expr : '';

export const isExpressionSavedToDB = store => getExpressionState(store) ? getExpressionState(store).isSavedToDB : false;