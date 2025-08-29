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

export const hasOverviewChanges = store => {
    const state = getOverviewState(store);
    if (!state) return false;
    
    // If already saved, no visual changes needed
    if (state.isSavedToDB) return false;
    
    // Check if there are any added/removed genes or species
    const hasAddedGenes = state.addedGenes && state.addedGenes.length > 0;
    const hasAddedSpecies = state.addedSpecies && state.addedSpecies.length > 0;
    
    // Check if gene model checkbox is checked (indicates change)
    const hasGeneModelChanges = state.geneModel && state.geneModel.checked;
    
    // Check if other species has non-empty values
    const hasOtherSpeciesChanges = state.otherSpecies && 
        state.otherSpecies.elements && 
        state.otherSpecies.elements.some(species => species.name && species.name.trim() !== "");
    
    // Check if current genes differ from saved genes
    const currentGenes = new Set(state.genes ? state.genes.elements : []);
    const savedGenes = new Set(state.savedGenes || []);
    const genesChanged = currentGenes.size !== savedGenes.size || 
        ![...currentGenes].every(gene => savedGenes.has(gene));
    
    // Check if current species differ from saved species  
    const currentSpecies = new Set(state.species ? state.species.elements : []);
    const savedSpecies = new Set(state.savedSpecies || []);
    const speciesChanged = currentSpecies.size !== savedSpecies.size || 
        ![...currentSpecies].every(species => savedSpecies.has(species));
    
    return hasAddedGenes || hasAddedSpecies || hasGeneModelChanges || 
           hasOtherSpeciesChanges || genesChanged || speciesChanged;
};