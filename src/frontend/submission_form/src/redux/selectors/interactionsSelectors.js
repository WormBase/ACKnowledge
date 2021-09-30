export const getInteractionsState = store => store.interactions;

export const getGeneticInteractions = store => getInteractionsState(store) ? getInteractionsState(store).geneint : {checked: false, details: ''};

export const getPhysicalInteractions = store => getInteractionsState(store) ? getInteractionsState(store).geneprod : {checked: false, details: ''};

export const getRegulatoryInteractions = store => getInteractionsState(store) ? getInteractionsState(store).genereg : {checked: false, details: ''};

export const isInteractionsSavedToDB = store => getInteractionsState(store) ? getInteractionsState(store).isSavedToDB : false;