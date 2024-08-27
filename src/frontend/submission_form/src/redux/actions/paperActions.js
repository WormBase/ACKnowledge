import axios from 'axios';
import {
    getCheckbxOrSingleFieldFromWBAPIData,
    getSetOfEntitiesFromWBAPIData,
    getTableValuesFromWBAPIData
} from "../../AFPValues";
import {setGeneModel, setGenes, setIsOverviewSavedToDB, setOtherSpecies, setSpecies} from "./overviewActions";
import {
    setAlleles,
    setIsGeneticsSavedToDB,
    setOtherAlleles,
    setOtherStrains,
    setSequenceChange,
    setStrains
} from "./geneticsActions";
import {
    setIsReagentSavedToDB,
    setNewAntibodies,
    setOtherAntibodies,
    setOtherTransgenes,
    setTransgenes
} from "./reagentActions";
import {
    setAdditionalExpr,
    setExpression,
    setIsExpressionSavedToDB,
    setRnaseq,
    setSiteOfAction,
    setTimeOfAction
} from "./expressionActions";
import {
    setGeneticInteractions,
    setIsInteractionsSavedToDB,
    setPhysicalInteractions,
    setRegulatoryInteractions
} from "./interactionsActions";
import {
    setAllelePhenotype,
    setChemicalPhenotype,
    setEnvironmentalPhenotype, setEnzymaticActivity, setIsPhenotypesSavedToDB, setOthergenefunc,
    setOverexprPhenotype,
    setRnaiPhenotype
} from "./phenotypesActions";
import {setDisease, setIsDiseaseSavedToDB} from "./diseaseActions";
import {setComments, setIsCommentsSavedToDB, setOtherCCContacts} from "./commentsActions";
import {showDataFetchError} from "./displayActions";

export const STORE_PAPER_INFO = "STORE_PAPER_INFO";
export const FETCH_PAPER_DATA_REQUEST = "FETCH_DATA_REQUEST";
export const FETCH_PAPER_DATA_SUCCESS = "FETCH_DATA_SUCCESS";
export const FETCH_PAPER_DATA_ERROR = "FETCH_DATA_ERROR";

export const storePaperInfo = (paperId, paperPasswd) => ({
    type: STORE_PAPER_INFO,
    payload: {
        paperPasswd: paperPasswd,
        paperId: paperId
    }
});

export const fetchPaperData = (paper_id, paper_passwd) => {
    return dispatch => {
        dispatch(fetchPaperDataRequest());
        axios.get(process.env.REACT_APP_API_READ_ENDPOINT + '&paper=' + paper_id + '&passwd=' + paper_passwd)
            .then(result => {
                // Overview
                let genes = getSetOfEntitiesFromWBAPIData(result.data.genestudied, result.data.genestudied, "WBGene");
                dispatch(setGenes(genes.entities(), genes.prevSaved()));
                let species = getSetOfEntitiesFromWBAPIData(result.data.species, result.data.species, undefined);
                dispatch(setSpecies(species.entities(), species.prevSaved()));
                let structCorrCB = getCheckbxOrSingleFieldFromWBAPIData(result.data.structcorr, undefined);
                dispatch(setGeneModel(structCorrCB.isChecked(), structCorrCB.details()));
                let otherSpecies = getTableValuesFromWBAPIData(result.data.otherspecies, false);
                dispatch(setOtherSpecies(otherSpecies.entities(), otherSpecies.prevSaved()));
                if (genes.prevSaved() && species.prevSaved() && structCorrCB.prevSaved() && otherSpecies.prevSaved()) {
                    dispatch(setIsOverviewSavedToDB());
                }

                // Genetics
                let alleles = getSetOfEntitiesFromWBAPIData(result.data.variation, result.data.variation, "");
                dispatch(setAlleles(alleles.entities(), alleles.prevSaved()));
                let strains = getSetOfEntitiesFromWBAPIData(result.data.strain, result.data.strain, "");
                dispatch(setStrains(strains.entities(), strains.prevSaved()));
                let seqChange = getCheckbxOrSingleFieldFromWBAPIData(result.data.seqchange, result.data.seqchange);
                dispatch(setSequenceChange(seqChange.isChecked(), seqChange.details()));
                let otherAlleles = getTableValuesFromWBAPIData(result.data.othervariation, false);
                dispatch(setOtherAlleles(otherAlleles.entities(), otherAlleles.prevSaved()));
                let otherStrains = getTableValuesFromWBAPIData(result.data.otherstrain, false);
                dispatch(setOtherStrains(otherStrains.entities(), otherStrains.prevSaved()));
                if (alleles.prevSaved() && strains.prevSaved() && seqChange.prevSaved() && otherAlleles.prevSaved() &&
                    otherStrains.prevSaved()) {
                    dispatch(setIsGeneticsSavedToDB());
                }

                // Reagent
                let transgenes = getSetOfEntitiesFromWBAPIData(result.data.transgene, result.data.transgene, "");
                dispatch(setTransgenes(transgenes.entities(), transgenes.prevSaved()));
                let otherTransgenes = getTableValuesFromWBAPIData(result.data.othertransgene, false);
                dispatch(setOtherTransgenes(otherTransgenes.entities(), otherTransgenes.prevSaved()));
                let otherAntibodies = getTableValuesFromWBAPIData(result.data.otherantibody, true);
                dispatch(setOtherAntibodies(otherAntibodies.entities(), otherAntibodies.prevSaved()));
                let newAntibodies = getCheckbxOrSingleFieldFromWBAPIData(result.data.antibody, undefined);
                dispatch(setNewAntibodies(newAntibodies.isChecked(), newAntibodies.details()));
                if (transgenes.prevSaved() && otherTransgenes.prevSaved() && otherAntibodies.prevSaved() &&
                    newAntibodies.prevSaved()) {
                    dispatch(setIsReagentSavedToDB());
                }

                // Expression
                let expression = getCheckbxOrSingleFieldFromWBAPIData(result.data.otherexpr, result.data.otherexpr);
                dispatch(setExpression(expression.isChecked(), expression.details()));
                let siteOfAction = getCheckbxOrSingleFieldFromWBAPIData(result.data.siteaction, undefined);
                dispatch(setSiteOfAction(siteOfAction.isChecked(), siteOfAction.details()));
                let timeOfAction = getCheckbxOrSingleFieldFromWBAPIData(result.data.timeaction, undefined);
                dispatch(setTimeOfAction(timeOfAction.isChecked(), timeOfAction.details()));
                let rnaSeq = getCheckbxOrSingleFieldFromWBAPIData(result.data.rnaseq, result.data.rnaseq);
                dispatch(setRnaseq(rnaSeq.isChecked(), rnaSeq.details()));
                let additionalExpr = getCheckbxOrSingleFieldFromWBAPIData(result.data.additionalexpr, undefined);
                dispatch(setAdditionalExpr(additionalExpr.details()));
                if (expression.prevSaved() && siteOfAction.prevSaved() && timeOfAction.prevSaved() &&
                    rnaSeq.prevSaved() && additionalExpr.prevSaved()) {
                    dispatch(setIsExpressionSavedToDB());
                }

                // Interactions
                let geneint = getCheckbxOrSingleFieldFromWBAPIData(result.data.geneint, result.data.geneint);
                dispatch(setGeneticInteractions(geneint.isChecked(), geneint.details()));
                let geneprod = getCheckbxOrSingleFieldFromWBAPIData(result.data.geneprod, result.data.geneprod);
                dispatch(setPhysicalInteractions(geneprod.isChecked(), geneprod.details()));
                let genereg = getCheckbxOrSingleFieldFromWBAPIData(result.data.genereg, result.data.genereg);
                dispatch(setRegulatoryInteractions(genereg.isChecked(), genereg.details()));
                if (geneint.prevSaved() && geneprod.prevSaved() && genereg.prevSaved()) {
                    dispatch(setIsInteractionsSavedToDB());
                }

                // Phenotype
                let newmutant = getCheckbxOrSingleFieldFromWBAPIData(result.data.newmutant, result.data.newmutant);
                dispatch(setAllelePhenotype(newmutant.isChecked(), newmutant.details()));
                let rnai = getCheckbxOrSingleFieldFromWBAPIData(result.data.rnai, result.data.rnai);
                dispatch(setRnaiPhenotype(rnai.isChecked(), rnai.details()));
                let overexpr = getCheckbxOrSingleFieldFromWBAPIData(result.data.overexpr, result.data.overexpr);
                dispatch(setOverexprPhenotype(overexpr.isChecked(), overexpr.details()));
                let chemphen = getCheckbxOrSingleFieldFromWBAPIData(result.data.chemphen, undefined);
                dispatch(setChemicalPhenotype(chemphen.isChecked(), chemphen.details()));
                let envpheno = getCheckbxOrSingleFieldFromWBAPIData(result.data.envpheno, undefined);
                dispatch(setEnvironmentalPhenotype(envpheno.isChecked(), envpheno.details()));
                let catalyticact = getCheckbxOrSingleFieldFromWBAPIData(result.data.catalyticact, result.data.catalyticact);
                dispatch(setEnzymaticActivity(catalyticact.isChecked(), catalyticact.details()));
                let othergenefunc = getCheckbxOrSingleFieldFromWBAPIData(result.data.othergenefunc, undefined);
                dispatch(setOthergenefunc(othergenefunc.isChecked(), othergenefunc.details()));
                if (newmutant.prevSaved() && rnai.prevSaved() && overexpr.prevSaved() && chemphen.prevSaved() &&
                    envpheno.prevSaved() && catalyticact.prevSaved() && othergenefunc.prevSaved()) {
                    dispatch(setIsPhenotypesSavedToDB());
                }

                // Disease
                let disease = getCheckbxOrSingleFieldFromWBAPIData(result.data.humdis, undefined);
                dispatch(setDisease(disease.isChecked(), disease.details()));
                if (disease.prevSaved()) {
                    dispatch(setIsDiseaseSavedToDB());
                }

                // Comments
                let comments = getCheckbxOrSingleFieldFromWBAPIData(result.data.comment, undefined);
                dispatch(setComments(comments.details()));
                let otherCCContacts = getCheckbxOrSingleFieldFromWBAPIData(result.data.communitycontact, undefined);
                dispatch(setOtherCCContacts(otherCCContacts.details()));
                if (comments.prevSaved() && otherCCContacts.prevSaved()) {
                    dispatch(setIsCommentsSavedToDB());
                }
                dispatch(fetchPaperDataSuccess());
            })
        .catch((error) => {
            console.log(error);
            dispatch(fetchPaperDataError(error));
            dispatch(showDataFetchError());
        });
    }
}

export const fetchPaperDataRequest = () => ({
   type: FETCH_PAPER_DATA_REQUEST,
});

export const fetchPaperDataSuccess = () => ({
    type: FETCH_PAPER_DATA_SUCCESS,
});

export const fetchPaperDataError = error => ({
    type: FETCH_PAPER_DATA_ERROR,
    payload: { error }
});