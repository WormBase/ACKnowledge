import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { saveWidgetData, saveAllUnsavedWidgets } from '../redux/actions/widgetActions';
import SaveOptionsModal from './modals/SaveOptionsModal';
import { WIDGET, WIDGET_TITLE } from '../constants';

/**
 * Reusable save button component that checks for unsaved changes in other widgets
 * and shows appropriate modal
 *
 * @param {object} payload - Data payload to save for current widget
 * @param {string} widgetName - Name of the current widget (from WIDGET constants)
 * @param {string} buttonText - Text to display on button (default: "Save and go to next section")
 * @param {function} onSaveComplete - Optional callback after save completes
 * @param {function} onBeforeSave - Optional validation callback before save (return false to cancel save)
 * @param {boolean} isGoToNext - Whether this is a "go to next section" button (default: true)
 */
const SaveButton = ({
    payload,
    widgetName,
    buttonText = "Save and go to next section",
    onSaveComplete,
    onBeforeSave,
    isGoToNext = true
}) => {
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);

    // Utility function to check if a widget has changes (same logic as in Menu.js)
    const hasWidgetChanges = (widgetState) => {
        if (!widgetState) return false;
        if (widgetState.isSavedToDB) return false;

        const arraysEqual = (a = [], b = []) => {
            if (a.length !== b.length) return false;
            const setA = new Set(a);
            const setB = new Set(b);
            return setA.size === setB.size && [...setA].every(x => setB.has(x));
        };

        let hasChanges = false;

        if (widgetState.genes && widgetState.savedGenes) {
            hasChanges = hasChanges || !arraysEqual(widgetState.genes.elements, widgetState.savedGenes);
        }
        if (widgetState.species && widgetState.savedSpecies) {
            hasChanges = hasChanges || !arraysEqual(widgetState.species.elements, widgetState.savedSpecies);
        }
        if (widgetState.alleles && widgetState.savedAlleles) {
            hasChanges = hasChanges || !arraysEqual(widgetState.alleles.elements, widgetState.savedAlleles);
        }
        if (widgetState.strains && widgetState.savedStrains) {
            hasChanges = hasChanges || !arraysEqual(widgetState.strains.elements, widgetState.savedStrains);
        }
        if (widgetState.transgenes && widgetState.savedTransgenes) {
            hasChanges = hasChanges || !arraysEqual(widgetState.transgenes.elements, widgetState.savedTransgenes);
        }
        if (widgetState.diseaseNames && widgetState.savedDiseaseNames) {
            hasChanges = hasChanges || !arraysEqual(widgetState.diseaseNames, widgetState.savedDiseaseNames);
        }

        // Helper function to check if checkbox state has changed from saved state
        const checkboxChanged = (current, saved) => {
            if (!current || !saved) return false;
            return current.checked !== saved.checked || current.details !== saved.details;
        };

        hasChanges = hasChanges ||
            (widgetState.addedGenes && widgetState.addedGenes.length > 0) ||
            (widgetState.addedSpecies && widgetState.addedSpecies.length > 0) ||
            (widgetState.addedAlleles && widgetState.addedAlleles.length > 0) ||
            (widgetState.addedStrains && widgetState.addedStrains.length > 0) ||
            (widgetState.newAlleles && widgetState.newAlleles.length > 0) ||
            (widgetState.newStrains && widgetState.newStrains.length > 0) ||
            (widgetState.addedTransgenes && widgetState.addedTransgenes.length > 0) ||
            (widgetState.addedDiseaseNames && widgetState.addedDiseaseNames.length > 0) ||
            (widgetState.comments && typeof widgetState.comments === 'string' && widgetState.comments.trim() !== '') ||
            (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.anatomical_term && typeof widgetState.otherExpressionEntities.anatomical_term === 'string' && widgetState.otherExpressionEntities.anatomical_term.trim() !== '') ||
            (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.life_stage && typeof widgetState.otherExpressionEntities.life_stage === 'string' && widgetState.otherExpressionEntities.life_stage.trim() !== '') ||
            (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.cellular_component && typeof widgetState.otherExpressionEntities.cellular_component === 'string' && widgetState.otherExpressionEntities.cellular_component.trim() !== '') ||
            (widgetState.otherPhenotypes && widgetState.otherPhenotypes.worm_phenotypes && typeof widgetState.otherPhenotypes.worm_phenotypes === 'string' && widgetState.otherPhenotypes.worm_phenotypes.trim() !== '') ||
            (widgetState.otherPhenotypes && widgetState.otherPhenotypes.phenotype_entity && typeof widgetState.otherPhenotypes.phenotype_entity === 'string' && widgetState.otherPhenotypes.phenotype_entity.trim() !== '') ||
            // Check checkboxes for various widgets - only if changed from saved state
            checkboxChanged(widgetState.geneModel, widgetState.savedGeneModel) ||
            checkboxChanged(widgetState.sequenceChange, widgetState.savedSequenceChange) ||
            checkboxChanged(widgetState.expression, widgetState.savedExpression) ||
            checkboxChanged(widgetState.siteOfAction, widgetState.savedSiteOfAction) ||
            checkboxChanged(widgetState.timeOfAction, widgetState.savedTimeOfAction) ||
            checkboxChanged(widgetState.additionalExpr, widgetState.savedAdditionalExpr) ||
            checkboxChanged(widgetState.geneint, widgetState.savedGeneint) ||
            checkboxChanged(widgetState.geneprod, widgetState.savedGeneprod) ||
            checkboxChanged(widgetState.genereg, widgetState.savedGenereg) ||
            checkboxChanged(widgetState.allelePheno, widgetState.savedAllelePheno) ||
            checkboxChanged(widgetState.rnaiPheno, widgetState.savedRnaiPheno) ||
            checkboxChanged(widgetState.overexprPheno, widgetState.savedOverexprPheno) ||
            checkboxChanged(widgetState.chemPheno, widgetState.savedChemPheno) ||
            checkboxChanged(widgetState.envPheno, widgetState.savedEnvPheno) ||
            checkboxChanged(widgetState.enzymaticAct, widgetState.savedEnzymaticAct) ||
            checkboxChanged(widgetState.othergenefunc, widgetState.savedOthergenefunc) ||
            checkboxChanged(widgetState.disease, widgetState.savedDisease) ||
            checkboxChanged(widgetState.newAntibodies, widgetState.savedNewAntibodies);

        return hasChanges;
    };

    // Get all widget states
    const overviewState = useSelector((state) => state.overview);
    const geneticsState = useSelector((state) => state.genetics);
    const reagentState = useSelector((state) => state.reagent);
    const expressionState = useSelector((state) => state.expression);
    const interactionsState = useSelector((state) => state.interactions);
    const phenotypesState = useSelector((state) => state.phenotypes);
    const diseaseState = useSelector((state) => state.disease);
    const commentsState = useSelector((state) => state.comments);

    // Check which other widgets have unsaved changes
    const getOtherWidgetsWithChanges = () => {
        const widgetsWithChanges = [];
        const widgetStateMap = {
            [WIDGET.OVERVIEW]: overviewState,
            [WIDGET.GENETICS]: geneticsState,
            [WIDGET.REAGENT]: reagentState,
            [WIDGET.EXPRESSION]: expressionState,
            [WIDGET.INTERACTIONS]: interactionsState,
            [WIDGET.PHENOTYPES]: phenotypesState,
            [WIDGET.DISEASE]: diseaseState,
            [WIDGET.COMMENTS]: commentsState
        };

        Object.keys(widgetStateMap).forEach((widget) => {
            // Skip current widget and Comments widget (special case)
            if (widget !== widgetName && widget !== WIDGET.COMMENTS) {
                if (hasWidgetChanges(widgetStateMap[widget])) {
                    widgetsWithChanges.push(WIDGET_TITLE[widget]);
                }
            }
        });

        return widgetsWithChanges;
    };

    const handleButtonClick = () => {
        // Run validation callback if provided
        if (onBeforeSave && !onBeforeSave()) {
            return;
        }

        const otherWidgetsWithChanges = getOtherWidgetsWithChanges();

        // If there are other widgets with changes, show modal
        if (otherWidgetsWithChanges.length > 0) {
            setShowModal(true);
        } else {
            // Otherwise, save current widget directly
            dispatch(saveWidgetData(payload, widgetName));
            if (onSaveComplete) {
                onSaveComplete();
            }
        }
    };

    const handleSaveCurrentOnly = () => {
        // Run validation callback if provided (shouldn't fail since already validated in handleButtonClick)
        if (onBeforeSave && !onBeforeSave()) {
            setShowModal(false);
            return;
        }

        dispatch(saveWidgetData(payload, widgetName));
        setShowModal(false);
        if (onSaveComplete) {
            onSaveComplete();
        }
    };

    const handleSaveAll = () => {
        // Run validation callback if provided (shouldn't fail since already validated in handleButtonClick)
        if (onBeforeSave && !onBeforeSave()) {
            setShowModal(false);
            return;
        }

        // First save current widget
        dispatch(saveWidgetData(payload, widgetName));
        // Then save all other unsaved widgets (excluding Comments)
        dispatch(saveAllUnsavedWidgets());
        setShowModal(false);
        if (onSaveComplete) {
            onSaveComplete();
        }
    };

    return (
        <>
            <SaveOptionsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSaveCurrentOnly={handleSaveCurrentOnly}
                onSaveAll={handleSaveAll}
                currentWidget={WIDGET_TITLE[widgetName]}
                otherWidgetsWithChanges={getOtherWidgetsWithChanges()}
                isGoToNext={isGoToNext}
            />
            <Button
                bsStyle="primary"
                onClick={handleButtonClick}
            >
                {buttonText}
            </Button>
        </>
    );
};

export default SaveButton;
