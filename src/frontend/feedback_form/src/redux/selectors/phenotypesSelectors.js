export const getPhenotypesState = store => store.phenotypes;

export const getAllelePhenotype = store => getPhenotypesState(store) ? getPhenotypesState(store).allelePheno : {checked: false, details: ''};

export const getRnaiPhenotype = store => getPhenotypesState(store) ? getPhenotypesState(store).rnaiPheno : {checked: false, details: ''};

export const getOverexprPhenotype = store => getPhenotypesState(store) ? getPhenotypesState(store).overexprPheno : {checked: false, details: ''};

export const getChemicalPhenotype = store => getPhenotypesState(store) ? getPhenotypesState(store).chemPheno : {checked: false, details: ''};

export const getEnvironmentalPhenotype = store => getPhenotypesState(store) ? getPhenotypesState(store).envPheno : {checked: false, details: ''};

export const getEnzymaticActivity = store => getPhenotypesState(store) ? getPhenotypesState(store).enzymaticAct : {checked: false, details: ''};

export const getOthergenefunc = store => getPhenotypesState(store) ? getPhenotypesState(store).othergenefunc : {checked: false, details: ''};

export const isPhenotypesSavedToDB = store => getPhenotypesState(store) ? getPhenotypesState(store).isSavedToDB : false;