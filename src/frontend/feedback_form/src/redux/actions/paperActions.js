import axios from 'axios';
import {
    getCheckbxOrSingleFieldFromWBAPIData,
    getSetOfEntitiesFromWBAPIData,
    getTableValuesFromWBAPIData
} from "../../AFPValues";
import {setGeneModel, setGenes, setIsOverviewSavedToDB, setSpecies} from "./overviewActions";
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
import {setComments, setIsCommentsSavedToDB} from "./commentsActions";

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
                let genes = getSetOfEntitiesFromWBAPIData(result.genestudied, result.genestudied, "WBGene");
                setGenes(genes.entities(), genes.prevSaved());
                let species = getSetOfEntitiesFromWBAPIData(result.species, result.species, undefined);
                setSpecies(species.entities(), species.prevSaved());
                let structCorrCB = getCheckbxOrSingleFieldFromWBAPIData(result.structcorr, undefined);
                setGeneModel(structCorrCB.isChecked(), structCorrCB.details());
                if (genes.prevSaved() && species.prevSaved() && structCorrCB.prevSaved()) {
                    setIsOverviewSavedToDB();
                }

                // Genetics
                let alleles = getSetOfEntitiesFromWBAPIData(result.variation, result.variation, "");
                setAlleles(alleles.entities(), alleles.prevSaved());
                let strains = getSetOfEntitiesFromWBAPIData(result.strain, result.strain, "");
                setStrains(strains.entities(), strains.prevSaved());
                let seqChange = getCheckbxOrSingleFieldFromWBAPIData(result.seqchange, result.seqchange);
                setSequenceChange(seqChange.isChecked(), seqChange.details());
                let otherAlleles = getTableValuesFromWBAPIData(result.othervariation, false);
                setOtherAlleles(otherAlleles.entities(), otherAlleles.prevSaved());
                let otherStrains = getTableValuesFromWBAPIData(result.otherstrain, false);
                setOtherStrains(otherStrains.entities(), otherStrains.prevSaved());
                if (alleles.prevSaved() && strains.prevSaved() && seqChange.prevSaved() && otherAlleles.prevSaved() &&
                    otherStrains.prevSaved()) {
                    setIsGeneticsSavedToDB();
                }

                // Reagent
                let transgenes = getSetOfEntitiesFromWBAPIData(result.transgene, result.transgene, "");
                setTransgenes(transgenes.entities(), transgenes.prevSaved());
                let otherTransgenes = getTableValuesFromWBAPIData(result.othertransgene, false);
                setOtherTransgenes(otherTransgenes.entities(), otherTransgenes.prevSaved());
                let otherAntibodies = getTableValuesFromWBAPIData(result.otherantibody, true);
                setOtherAntibodies(otherAntibodies.entities(), otherAntibodies.prevSaved())
                let newAntibodies = getCheckbxOrSingleFieldFromWBAPIData(result.antibody, undefined);
                setNewAntibodies(newAntibodies.isChecked(), newAntibodies.details());
                if (transgenes.prevSaved() && otherTransgenes.prevSaved() && otherAntibodies.prevSaved() &&
                    newAntibodies.prevSaved()) {
                    setIsReagentSavedToDB();
                }

                // Expression
                let expression = getCheckbxOrSingleFieldFromWBAPIData(result.otherexpr, result.otherexpr);
                setExpression(expression.isChecked(), expression.details());
                let siteOfAction = getCheckbxOrSingleFieldFromWBAPIData(result.siteaction, undefined);
                setSiteOfAction(siteOfAction.isChecked(), siteOfAction.details());
                let timeOfAction = getCheckbxOrSingleFieldFromWBAPIData(result.timeaction, undefined);
                setTimeOfAction(timeOfAction.isChecked(), timeOfAction.details());
                let rnaSeq = getCheckbxOrSingleFieldFromWBAPIData(result.rnaseq, result.rnaseq);
                setRnaseq(rnaSeq.isChecked(), rnaSeq.details());
                let additionalExpr = getCheckbxOrSingleFieldFromWBAPIData(result.additionalexpr, undefined);
                setAdditionalExpr(additionalExpr.isChecked(), additionalExpr.details());
                if (expression.prevSaved() && siteOfAction.prevSaved() && timeOfAction.prevSaved() &&
                    rnaSeq.prevSaved() && additionalExpr.prevSaved()) {
                    setIsExpressionSavedToDB();
                }

                // Interactions
                let geneint = getCheckbxOrSingleFieldFromWBAPIData(result.geneint, result.geneint);
                setGeneticInteractions(geneint.isChecked(), geneint.details())
                let geneprod = getCheckbxOrSingleFieldFromWBAPIData(result.geneprod, result.geneprod);
                setPhysicalInteractions(geneprod.isChecked(), geneprod.details())
                let genereg = getCheckbxOrSingleFieldFromWBAPIData(result.genereg, result.genereg);
                setRegulatoryInteractions(genereg.isChecked(), genereg.details());
                if (geneint.prevSaved() && geneprod.prevSaved() && genereg.prevSaved()) {
                    setIsInteractionsSavedToDB();
                }

                // Phenotype
                let newmutant = getCheckbxOrSingleFieldFromWBAPIData(result.newmutant, result.newmutant);
                setAllelePhenotype(newmutant.isChecked(), newmutant.details());
                let rnai = getCheckbxOrSingleFieldFromWBAPIData(result.rnai, result.rnai);
                setRnaiPhenotype(rnai.isChecked(), rnai.details());
                let overexpr = getCheckbxOrSingleFieldFromWBAPIData(result.overexpr, result.overexpr);
                setOverexprPhenotype(overexpr.isChecked(), overexpr.details());
                let chemphen = getCheckbxOrSingleFieldFromWBAPIData(result.chemphen, undefined);
                setChemicalPhenotype(chemphen.isChecked(), chemphen.details());
                let envpheno = getCheckbxOrSingleFieldFromWBAPIData(result.envpheno, undefined);
                setEnvironmentalPhenotype(envpheno.isChecked(), envpheno.details());
                let catalyticact = getCheckbxOrSingleFieldFromWBAPIData(result.catalyticact, undefined);
                setEnzymaticActivity(catalyticact.isChecked(), catalyticact.details());
                let othergenefunc = getCheckbxOrSingleFieldFromWBAPIData(result.othergenefunc, undefined);
                setOthergenefunc(othergenefunc.isChecked(), othergenefunc.details());
                if (newmutant.prevSaved() && rnai.prevSaved() && overexpr.prevSaved() && chemphen.prevSaved() &&
                    envpheno.prevSaved() && catalyticact.prevSaved() && othergenefunc.prevSaved()) {
                    setIsPhenotypesSavedToDB();
                }

                // Disease
                let disease = getCheckbxOrSingleFieldFromWBAPIData(result.humdis, undefined);
                setDisease(disease.isChecked(), disease.details());
                if (disease.prevSaved()) {
                    setIsDiseaseSavedToDB();
                }

                // Comments
                let comments = getCheckbxOrSingleFieldFromWBAPIData(result.comment, undefined);
                setComments(comments.details());
                if (comments.prevSaved()) {
                    setIsCommentsSavedToDB();
                }
                dispatch(fetchPaperDataSuccess());
            })
        .catch((error) => {
            console.log(error);
            fetchPaperDataError(error);
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