import React from 'react';
import { Button, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { saveCurrentWidget } from '../redux/actions/widgetActions';
import { WIDGET_TITLE } from '../constants';

const SaveCurrentWidgetButton = () => {
    const dispatch = useDispatch();
    
    // Get current widget
    const currentWidget = useSelector((state) => state.widget.selectedWidget);
    const currentWidgetName = WIDGET_TITLE[currentWidget] || 'Current Section';
    
    // Check if current widget is already saved - if saved, no changes to save
    const isCurrentWidgetSaved = useSelector((state) => {
        switch (currentWidget) {
            case 1: return state.overview.isSavedToDB;
            case 2: return state.genetics.isSavedToDB;
            case 3: return state.reagent.isSavedToDB;
            case 4: return state.expression.isSavedToDB;
            case 5: return state.interactions.isSavedToDB;
            case 6: return state.phenotypes.isSavedToDB;
            case 7: return state.disease.isSavedToDB;
            case 8: return state.comments.isSavedToDB;
            default: return false;
        }
    });
    
    // Get current widget data to check for actual changes
    const currentWidgetData = useSelector((state) => {
        switch (currentWidget) {
            case 1: return state.overview;
            case 2: return state.genetics;
            case 3: return state.reagent;
            case 4: return state.expression;
            case 5: return state.interactions;
            case 6: return state.phenotypes;
            case 7: return state.disease;
            case 8: return state.comments;
            default: return null;
        }
    });
    
    // Check if widget has meaningful data that would warrant saving
    const hasChanges = React.useMemo(() => {
        if (!currentWidgetData) return false;
        
        switch (currentWidget) {
            case 1: // Overview
                return (currentWidgetData.genes.elements.length > 0 ||
                        currentWidgetData.species.elements.length > 0 ||
                        currentWidgetData.geneModel.checked ||
                        currentWidgetData.otherSpecies.elements.length > 0);
            case 2: // Genetics
                return (currentWidgetData.alleles.elements.length > 0 ||
                        currentWidgetData.strains.elements.length > 0 ||
                        currentWidgetData.sequenceChange.checked ||
                        currentWidgetData.otherAlleles.elements.length > 0 ||
                        currentWidgetData.otherStrains.elements.length > 0);
            case 3: // Reagent
                return (currentWidgetData.transgenes.elements.length > 0 ||
                        currentWidgetData.newAntibodies.checked ||
                        currentWidgetData.otherTransgenes.elements.length > 0 ||
                        currentWidgetData.otherAntibodies.elements.length > 0);
            case 4: // Expression
                return (currentWidgetData.anatomicExpression.checked ||
                        currentWidgetData.siteOfAction.checked ||
                        currentWidgetData.timeOfAction.checked ||
                        currentWidgetData.rnaseq.checked ||
                        (currentWidgetData.additionalExpr && currentWidgetData.additionalExpr.trim() !== ''));
            case 5: // Interactions
                return (currentWidgetData.geneticInteractions.checked ||
                        currentWidgetData.physicalInteractions.checked ||
                        currentWidgetData.regulatoryInteractions.checked);
            case 6: // Phenotypes
                return (currentWidgetData.allelePhenotypes.checked ||
                        currentWidgetData.rnaiPhenotypes.checked ||
                        currentWidgetData.transoverPhenotypes.checked ||
                        currentWidgetData.chemicalPhenotypes.checked ||
                        currentWidgetData.envPhenotypes.checked ||
                        currentWidgetData.catalyticActivity.checked ||
                        currentWidgetData.commentPhenotypes.checked);
            case 7: // Disease
                return (currentWidgetData.disease.checked ||
                        currentWidgetData.diseaseNames.elements.length > 0);
            case 8: // Comments
                return (currentWidgetData.comments && currentWidgetData.comments.trim() !== '');
            default:
                return false;
        }
    }, [currentWidget, currentWidgetData]);
    
    // Check if we're currently loading
    const isLoading = useSelector((state) => state.display.loading);
    
    const handleSave = () => {
        dispatch(saveCurrentWidget());
    };
    
    const tooltip = (
        <Tooltip id="save-current-tooltip">
            {isCurrentWidgetSaved 
                ? `${currentWidgetName} is already saved`
                : hasChanges 
                    ? `Save ${currentWidgetName} and mark as complete`
                    : `No changes made to ${currentWidgetName}`
            }
        </Tooltip>
    );
    
    return (
        <div style={{ marginBottom: '10px' }}>
            <OverlayTrigger placement="top" overlay={tooltip}>
                <Button
                    bsStyle={isCurrentWidgetSaved ? "success" : hasChanges ? "info" : "primary"}
                    bsSize="small"
                    onClick={handleSave}
                    disabled={isLoading || !hasChanges}
                    style={{
                        width: '100%',
                        fontSize: '12px',
                        padding: '6px 12px'
                    }}
                >
                    {isLoading ? (
                        <>
                            <Glyphicon glyph="refresh" className="spinning-icon" style={{ marginRight: '6px' }} />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Glyphicon glyph={isCurrentWidgetSaved ? "ok" : "cloud-upload"} style={{ marginRight: '6px' }} />
                            {isCurrentWidgetSaved ? 'Saved' : 'Save Current Section'}
                        </>
                    )}
                </Button>
            </OverlayTrigger>
            
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinning-icon {
                        animation: spin 1s linear infinite;
                    }
                `}
            </style>
        </div>
    );
};

export default SaveCurrentWidgetButton;