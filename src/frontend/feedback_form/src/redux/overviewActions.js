import {
    SET_GENES,
    ADD_GENE,
    REMOVE_GENE,
    SET_SPECIES,
    ADD_SPECIES,
    REMOVE_SPECIES,
    SET_GENE_MODEL
} from "./overviewActionTypes";

export function setGenes(elements, saved) {
    return {
        type: SET_GENES,
        payload: {
            elements: elements,
            saved: saved
        }
    }
}

export const addGene = gene => ({
    type: ADD_GENE,
    payload: {
        gene
    }
});

export const removeGene = gene => ({
    type: REMOVE_GENE,
    payload: {
        gene
    }
});

export function setSpecies(elements, saved) {
   return {
       type: SET_SPECIES,
       payload: {
           elements: elements,
           saved: saved
       }
   }
}

export const addSpecies = species => ({
    type: ADD_SPECIES,
    payload: {
        species
    }
});

export const removeSpecies = species => ({
    type: REMOVE_SPECIES,
    payload: {
        species
    }
});

export function setGeneModel(checked, details) {
    return {
        type: SET_GENE_MODEL,
        payload: {
            checked: checked,
            details: details
        }
    };
}