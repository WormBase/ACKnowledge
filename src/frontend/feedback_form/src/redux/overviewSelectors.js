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

export const getGenesMatchingString = (store, searchString) => {
  return getGenes(store).filter(element => element.content.startsWith(searchString));
};

export const getSpeciesMatchingString = (store, searchString) => {
  return getSpecies(store).filter(element => element.content.startsWith(searchString));
};