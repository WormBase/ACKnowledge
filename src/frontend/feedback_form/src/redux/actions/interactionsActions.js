export const SET_GENETIC_INTERACTIONS = "SET_GENETIC_INTERACTIONS";
export const TOGGLE_GENETIC_INTERACTIONS = "TOGGLE_GENETIC_INTERACTIONS";
export const SET_PHYSICAL_INTERACTIONS = "SET_PHYSICAL_INTERACTIONS";
export const TOGGLE_PHYSICAL_INTERACTIONS = "TOGGLE_PHYSICAL_INTERACTIONS";
export const SET_REGULATORY_INTERACTIONS = "SET_REGULATORY_INTERACTIONS";
export const TOGGLE_REGULATORY_INTERACTIONS = "TOGGLE_REGULATORY_INTERACTIONS";
export const SET_IS_INTERACTIONS_SAVED_TO_DB = "SET_IS_INTERACTIONS_SAVED_TO_DB";


export const setGeneticInteractions = (checked, details) => ({
    type: SET_GENETIC_INTERACTIONS,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleGeneticInteractions = () => ({
    type: TOGGLE_GENETIC_INTERACTIONS,
    payload: {}
});

export const setPhysicalInteractions = (checked, details) => ({
    type: SET_PHYSICAL_INTERACTIONS,
    payload: {
        checked: checked,
        details: details
    }
});

export const togglePhysicalInteractions = () => ({
    type: TOGGLE_PHYSICAL_INTERACTIONS,
    payload: {}
});

export const setRegulatoryInteractions = (checked, details) => ({
    type: SET_REGULATORY_INTERACTIONS,
    payload: {
        checked: checked,
        details: details
    }
});

export const toggleRegulatoryInteractions = () => ({
    type: TOGGLE_REGULATORY_INTERACTIONS,
    payload: {}
});

export const setIsInteractionsSavedToDB = () => ({
    type: SET_IS_INTERACTIONS_SAVED_TO_DB,
    payload: {}
});