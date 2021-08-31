export function getGeneticsState(store) {
  return store.genetics;
}

export const getAlleles = store => getGeneticsState(store) ? getGeneticsState(store).alleles : {elements: [], saved: false};

export const getStrains = store => getGeneticsState(store) ? getGeneticsState(store).strains : {elements: [], saved: false};

export const getSequenceChange = store => getGeneticsState(store) ? getGeneticsState(store).sequenceChange :
    {checked: false, details: ''};

export const isGeneticsSavedToDB = store => getGeneticsState(store) ? getGeneticsState(store).isSavedToDB : false;

export const getOtherAlleles = store => getGeneticsState(store) ? getGeneticsState(store).otherAlleles : {elements: [ { id: 1, name: "" } ], saved: false};

export const getOtherStrains = store => getGeneticsState(store) ? getGeneticsState(store).otherStrains : {elements: [ { id: 1, name: "" } ], saved: false};

export const getAddedStrains = store => getGeneticsState(store) ? getGeneticsState(store).addedStrains : [];
export const getAddedAlleles = store => getGeneticsState(store) ? getGeneticsState(store).addedAlleles : [];

export const getStrainAlreadyPresentError = store => getGeneticsState(store) ? getGeneticsState(store).strainAlreadyPresentError : false;
