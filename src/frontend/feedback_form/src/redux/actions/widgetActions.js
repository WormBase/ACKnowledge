import axios from 'axios';
import {setLoading, showDataSaved, unsetLoading} from "./displayActions";
import {setIsOverviewSavedToDB} from "./overviewActions";
import {setIsGeneticsSavedToDB} from "./geneticsActions";
import {setIsReagentSavedToDB} from "./reagentActions";
import {setIsExpressionSavedToDB} from "./expressionActions";
import {setIsPhenotypesSavedToDB} from "./phenotypesActions";
import {setIsInteractionsSavedToDB} from "./interactionsActions";
import {setIsDiseaseSavedToDB} from "./diseaseActions";
import {setIsCommentsSavedToDB} from "./commentsActions";
import {WIDGET} from "../../constants";

export const saveWidgetData = (dataToSave, widget) => {
    return dispatch => {
        dispatch(setLoading());
        axios.post(process.env.REACT_APP_API_DB_WRITE_ENDPOINT, dataToSave)
            .then(result => {
                switch (widget) {
                    case WIDGET.OVERVIEW:
                        dispatch(setIsOverviewSavedToDB());
                        break;
                    case WIDGET.GENETICS:
                        dispatch(setIsGeneticsSavedToDB());
                        break;
                    case WIDGET.REAGENT:
                        dispatch(setIsReagentSavedToDB());
                        break;
                    case WIDGET.EXPRESSION:
                        dispatch(setIsExpressionSavedToDB());
                        break;
                    case WIDGET.PHENOTYPES:
                        dispatch(setIsPhenotypesSavedToDB());
                        break;
                    case WIDGET.INTERACTIONS:
                        dispatch(setIsInteractionsSavedToDB());
                        break;
                    case WIDGET.DISEASE:
                        dispatch(setIsDiseaseSavedToDB());
                        break;
                    case WIDGET.COMMENTS:
                        dispatch(setIsCommentsSavedToDB());
                        break;
                }
                dispatch(showDataSaved(true, false));
            })
            .catch((error) => {
                dispatch(showDataSaved(false, false));
            }).finally(() => {
                dispatch(unsetLoading());
            });
    }
}
