export function getOverviewState(store) {
  return store.overview;
}

export function getGenes(store) {
  if (getOverviewState(store)) {
    return getOverviewState(store).genes;
  } else {
    return new Set();
  }
}

export const getSpecies = store => getOverviewState(store) ? getOverviewState(store).species : new Set();

export const getGeneModel = store => getOverviewState(store) ? getOverviewState(store).geneModel :
    {checked: false, details: ''};

export const isOverviewSavedToDB = store => getOverviewState(store) ? getOverviewState(store).isSavedToDB : false;

export const getAddedGenes = store => getOverviewState(store) ? getOverviewState(store).addedGenes : [];
export const getAddedSpecies = store => getOverviewState(store) ? getOverviewState(store).addedSpecies : [];

export const getOtherSpecies = store => getOverviewState(store) ? getOverviewState(store).otherSpecies : {elements: [ { id: 1, name: "" } ], saved: false};