export const getReagentState = store => store.reagent;

export const getTransgenes = store => getReagentState(store) ? getReagentState(store).transgenes : {elements: [], saved: false};

export const getNewAntibodies = store => getReagentState(store) ? getReagentState(store).newAntibodies : {checked: false, details: ''};

export const getOtherTransgenes = store => getReagentState(store) ? getReagentState(store).otherTransgenes : {elements: [ { id: 1, name: "" } ], saved: false};

export const isReagentSavedToDB = store => getReagentState(store) ? getReagentState(store).isSavedToDB : false;

export const getOtherAntibodies = store => getReagentState(store) ? getReagentState(store).otherAntibodies : {elements: [ { id: 1, name: "", publicationId: "" } ], saved: false};