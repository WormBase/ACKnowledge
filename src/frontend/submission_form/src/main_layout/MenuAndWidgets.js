import React, {useState, useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {SectionsNotCompletedModal, WelcomeModal, CompletedSubmissionModal} from "../components/modals/MainModals";
import DataSavedModal from "../components/modals/DataSavedModal";
import ProgressSavedModal from "../components/modals/ProgressSavedModal";
import PersonSelector from "../components/PersonSelector";
import {MENU_INDEX, pages, WIDGET, WIDGET_TITLE} from "../constants";
import {useDispatch, useSelector} from "react-redux";
import {hideDataSaved, hideSectionsNotCompleted} from "../redux/actions/displayActions";
import Menu from "./Menu";
import {setSelectedWidget, saveAllUnsavedWidgets} from "../redux/actions/widgetActions";
import WidgetArea from "./WidgetArea";
import {Button, Glyphicon, OverlayTrigger, Tooltip} from "react-bootstrap";

// CSS animation for the pulsing finish button
const pulseAnimation = `
    @keyframes pulse-glow {
        0% {
            box-shadow: 0 0 5px rgba(92, 184, 92, 0.7), 0 0 10px rgba(92, 184, 92, 0.4);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 20px rgba(92, 184, 92, 0.9), 0 0 30px rgba(92, 184, 92, 0.6), 0 0 40px rgba(92, 184, 92, 0.3);
            transform: scale(1.02);
        }
        100% {
            box-shadow: 0 0 5px rgba(92, 184, 92, 0.7), 0 0 10px rgba(92, 184, 92, 0.4);
            transform: scale(1);
        }
    }
`;

const MenuAndWidgets = (props) => {
    const dispatch = useDispatch();
    const currentLocation = props.location.pathname;
    if (currentLocation !== "" && currentLocation !== "/") {
        dispatch(setSelectedWidget(MENU_INDEX[currentLocation.substring(1)]));
    }
    const [showPopup, setShowPopup] = useState(true);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [initialPerson, setInitialPerson] = useState(null);
    const selectedWidget = useSelector((state) => state.widget.selectedWidget);

    // Utility function to check if a widget has changes (same as in Menu.js)
    const hasWidgetChanges = (widgetState) => {
        if (!widgetState) return false;
        // If saved to DB, no changes needed
        if (widgetState.isSavedToDB) return false;
        
        // Helper function to compare arrays
        const arraysEqual = (a = [], b = []) => {
            if (a.length !== b.length) return false;
            const setA = new Set(a);
            const setB = new Set(b);
            return setA.size === setB.size && [...setA].every(x => setB.has(x));
        };
        
        // Check for changes by comparing current state with saved state
        let hasChanges = false;
        
        // For Overview widget
        if (widgetState.genes && widgetState.savedGenes) {
            hasChanges = hasChanges || !arraysEqual(widgetState.genes.elements, widgetState.savedGenes);
        }
        if (widgetState.species && widgetState.savedSpecies) {
            hasChanges = hasChanges || !arraysEqual(widgetState.species.elements, widgetState.savedSpecies);
        }
        
        // For Genetics widget
        if (widgetState.alleles && widgetState.savedAlleles) {
            hasChanges = hasChanges || !arraysEqual(widgetState.alleles.elements, widgetState.savedAlleles);
        }
        if (widgetState.strains && widgetState.savedStrains) {
            hasChanges = hasChanges || !arraysEqual(widgetState.strains.elements, widgetState.savedStrains);
        }
        
        // For Reagent widget  
        if (widgetState.transgenes && widgetState.savedTransgenes) {
            hasChanges = hasChanges || !arraysEqual(widgetState.transgenes.elements, widgetState.savedTransgenes);
        }
        
        // For Disease widget
        if (widgetState.diseaseNames && widgetState.savedDiseaseNames) {
            hasChanges = hasChanges || !arraysEqual(widgetState.diseaseNames, widgetState.savedDiseaseNames);
        }
        
        // Check for other changes
        hasChanges = hasChanges ||
               (widgetState.addedGenes && widgetState.addedGenes.length > 0) ||
               (widgetState.addedSpecies && widgetState.addedSpecies.length > 0) ||
               (widgetState.addedAlleles && widgetState.addedAlleles.length > 0) ||
               (widgetState.addedStrains && widgetState.addedStrains.length > 0) ||
               (widgetState.newAlleles && widgetState.newAlleles.length > 0) ||
               (widgetState.newStrains && widgetState.newStrains.length > 0) ||
               (widgetState.addedTransgenes && widgetState.addedTransgenes.length > 0) ||
               (widgetState.addedDiseaseNames && widgetState.addedDiseaseNames.length > 0) ||
               (widgetState.newAntibodies && widgetState.newAntibodies.checked) ||
               (widgetState.comments && typeof widgetState.comments === 'string' && widgetState.comments.trim() !== '') ||
               // Check text fields for new entities
               (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.anatomical_term && typeof widgetState.otherExpressionEntities.anatomical_term === 'string' && widgetState.otherExpressionEntities.anatomical_term.trim() !== '') ||
               (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.life_stage && typeof widgetState.otherExpressionEntities.life_stage === 'string' && widgetState.otherExpressionEntities.life_stage.trim() !== '') ||
               (widgetState.otherExpressionEntities && widgetState.otherExpressionEntities.cellular_component && typeof widgetState.otherExpressionEntities.cellular_component === 'string' && widgetState.otherExpressionEntities.cellular_component.trim() !== '') ||
               (widgetState.otherPhenotypes && widgetState.otherPhenotypes.worm_phenotypes && typeof widgetState.otherPhenotypes.worm_phenotypes === 'string' && widgetState.otherPhenotypes.worm_phenotypes.trim() !== '') ||
               (widgetState.otherPhenotypes && widgetState.otherPhenotypes.phenotype_entity && typeof widgetState.otherPhenotypes.phenotype_entity === 'string' && widgetState.otherPhenotypes.phenotype_entity.trim() !== '') ||
               // Check checkboxes for various widgets
               (widgetState.geneModel && widgetState.geneModel.checked) ||
               (widgetState.sequenceChange && widgetState.sequenceChange.checked) ||
               (widgetState.expression && widgetState.expression.checked) ||
               (widgetState.siteOfAction && widgetState.siteOfAction.checked) ||
               (widgetState.timeOfAction && widgetState.timeOfAction.checked) ||
               (widgetState.additionalExpr && widgetState.additionalExpr.checked) ||
               (widgetState.geneint && widgetState.geneint.checked) ||
               (widgetState.geneprod && widgetState.geneprod.checked) ||
               (widgetState.genereg && widgetState.genereg.checked) ||
               (widgetState.allelePheno && widgetState.allelePheno.checked) ||
               (widgetState.rnaiPheno && widgetState.rnaiPheno.checked) ||
               (widgetState.overexprPheno && widgetState.overexprPheno.checked) ||
               (widgetState.chemPheno && widgetState.chemPheno.checked) ||
               (widgetState.envPheno && widgetState.envPheno.checked) ||
               (widgetState.enzymaticAct && widgetState.enzymaticAct.checked) ||
               (widgetState.othergenefunc && widgetState.othergenefunc.checked) ||
               (widgetState.disease && widgetState.disease.checked);
               
        return hasChanges;
    };
    
    // Check if all sections are saved
    const allSectionsSaved = useSelector((state) => 
        state.overview.isSavedToDB &&
        state.genetics.isSavedToDB &&
        state.reagent.isSavedToDB &&
        state.expression.isSavedToDB &&
        state.interactions.isSavedToDB &&
        state.phenotypes.isSavedToDB &&
        state.disease.isSavedToDB &&
        state.comments.isSavedToDB
    );
    
    // Check if all sections except Comments are saved
    const allSectionsExceptCommentsSaved = useSelector((state) => 
        state.overview.isSavedToDB &&
        state.genetics.isSavedToDB &&
        state.reagent.isSavedToDB &&
        state.expression.isSavedToDB &&
        state.interactions.isSavedToDB &&
        state.phenotypes.isSavedToDB &&
        state.disease.isSavedToDB
    );
    
    // Check if we're currently on the Comments widget
    const isOnCommentsWidget = selectedWidget === MENU_INDEX[WIDGET.COMMENTS];

    // Check if any section has unsaved changes (excluding Comments - final submission only)
    const hasAnyChanges = useSelector((state) => 
        hasWidgetChanges(state.overview) ||
        hasWidgetChanges(state.genetics) ||
        hasWidgetChanges(state.reagent) ||
        hasWidgetChanges(state.expression) ||
        hasWidgetChanges(state.interactions) ||
        hasWidgetChanges(state.phenotypes) ||
        hasWidgetChanges(state.disease)
        // Comments excluded - saving it triggers final submission
    );
    
    // Get the current person from state
    const currentPerson = useSelector((state) => state.person.person);
    
    // Check if data is loaded
    const paperDataLoaded = useSelector((state) => !state.paper.paperData.isLoading);
    const personDataLoaded = useSelector((state) => !state.person.person.isLoading);
    
    useEffect(() => {
        // When data is loaded and we haven't set the initial person yet
        if (paperDataLoaded && personDataLoaded && currentPerson.name && !initialPerson) {
            setInitialPerson(currentPerson);
            
            // If all sections are saved, show the completed modal instead of welcome
            if (allSectionsSaved) {
                setShowCompletedModal(true);
                setShowPopup(false);
            }
        }
    }, [paperDataLoaded, personDataLoaded, allSectionsSaved, currentPerson, initialPerson]);

    const goToNextSection = () => {
        const newSelectedMenu = Math.min(selectedWidget + 1, pages.length);
        dispatch(setSelectedWidget(newSelectedMenu));
        dispatch(hideDataSaved());
        props.history.push(pages[newSelectedMenu - 1] + props.location.search);
        window.scrollTo(0, 0)
    }

    return (
        <div className="container" style={{maxWidth: '1400px', padding: '0 10px'}}>
            <div className="row" style={{margin: '0 -5px'}}>
                <div className="col-sm-3" style={{padding: '0 5px'}}>
                    <div className="panel panel-default" style={{marginBottom: '10px'}}>
                        <div className="panel-body" style={{padding: '8px'}}>
                            <PersonSelector/>
                        </div>
                    </div>
                    <div style={{marginBottom: '10px', position: 'relative'}}>
                        {/* Add the animation styles */}
                        <style>{pulseAnimation}</style>
                        
                        {/* Show a badge when ready to submit (but not if already on Comments) */}
                        {allSectionsExceptCommentsSaved && !isOnCommentsWidget && (
                            <div style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: '#d9534f',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                zIndex: 1,
                                animation: 'pulse-glow 2s infinite'
                            }}>!</div>
                        )}
                        
                        <OverlayTrigger 
                            placement="right" 
                            overlay={
                                <Tooltip id="save-progress-tooltip">
                                    {allSectionsExceptCommentsSaved && !isOnCommentsWidget
                                        ? <strong>🎉 All sections are complete! Click here to go to the Comments section and finalize your submission to WormBase.</strong>
                                        : !hasAnyChanges 
                                            ? "No unsaved changes to save."
                                            : "Saves your current progress across all sections that have changes (except Comments). To finalize and submit your data, click 'Finish and Submit' in the Comments section."
                                    }
                                </Tooltip>
                            }
                        >
                            <Button 
                                bsStyle={(allSectionsExceptCommentsSaved && !isOnCommentsWidget) ? "success" : "primary"}
                                bsSize={(allSectionsExceptCommentsSaved && !isOnCommentsWidget) ? "large" : "small"}
                                onClick={() => {
                                    if (allSectionsExceptCommentsSaved && !isOnCommentsWidget) {
                                        // Navigate to Comments section for final submission
                                        dispatch(setSelectedWidget(MENU_INDEX[WIDGET.COMMENTS]));
                                        props.history.push(WIDGET.COMMENTS + props.location.search);
                                        window.scrollTo(0, 0);
                                    } else {
                                        dispatch(saveAllUnsavedWidgets());
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    ...((allSectionsExceptCommentsSaved && !isOnCommentsWidget) ? {
                                        animation: 'pulse-glow 2s infinite',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        padding: '10px 15px',
                                        border: '2px solid #4cae4c',
                                        position: 'relative',
                                        overflow: 'visible'
                                    } : {})
                                }}
                                disabled={!hasAnyChanges && !(allSectionsExceptCommentsSaved && !isOnCommentsWidget)}
                            >
                                <Glyphicon glyph={(allSectionsExceptCommentsSaved && !isOnCommentsWidget) ? "send" : "cloud-upload"} style={{marginRight: '6px'}} />
                                {(allSectionsExceptCommentsSaved && !isOnCommentsWidget) ? "FINISH AND SUBMIT" : "Save current progress"}
                            </Button>
                        </OverlayTrigger>
                    </div>
                    <Menu urlQuery={props.location.search}/>
                </div>
                <div className="col-sm-9" style={{padding: '0 5px', paddingLeft: '15px'}}>
                    <div className="panel panel-default">
                        <div className="panel-body" style={{padding: '12px'}}>
                            <WidgetArea urlQuery={props.location.search} history={props.history}/>
                        </div>
                    </div>
                </div>
                <WelcomeModal show={showPopup && !showCompletedModal} onHide={() => setShowPopup(false)}/>
                <CompletedSubmissionModal 
                    show={showCompletedModal} 
                    onHide={() => setShowCompletedModal(false)}
                    previousAuthor={initialPerson ? initialPerson.name : ""}
                />
                <DataSavedModal show={useSelector((state) => state.display.dataSaved).showMessage} goToNextSection={goToNextSection}
                                success={useSelector((state) => state.display.dataSaved).success}
                                last_widget={useSelector((state) => state.display.dataSaved).lastWidget}/>
                <SectionsNotCompletedModal show={useSelector((state) => state.display.sectionsNotCompleted)}
                                           onHide={() => dispatch(hideSectionsNotCompleted())}
                                           sections={[
                                               useSelector((state) => state.overview.isSavedToDB) ? -1 : WIDGET.OVERVIEW,
                                               useSelector((state) => state.genetics.isSavedToDB) ? -1 : WIDGET.GENETICS,
                                               useSelector((state) => state.reagent.isSavedToDB) ? -1 : WIDGET.REAGENT,
                                               useSelector((state) => state.expression.isSavedToDB) ? -1 : WIDGET.EXPRESSION,
                                               useSelector((state) => state.interactions.isSavedToDB) ? -1 : WIDGET.INTERACTIONS,
                                               useSelector((state) => state.phenotypes.isSavedToDB) ? -1 : WIDGET.PHENOTYPES,
                                               useSelector((state) => state.disease.isSavedToDB) ? -1 : WIDGET.DISEASE,
                                               useSelector((state) => state.comments.isSavedToDB) ? -1 : WIDGET.COMMENTS
                                           ].filter((widgetIdx) => widgetIdx !== -1 && widgetIdx !== WIDGET.COMMENTS).map((idx) => WIDGET_TITLE[idx])}/>
                <ProgressSavedModal show={useSelector((state) => state.display.progressSaved)} />
            </div>
        </div>
    );
}

export default withRouter(MenuAndWidgets);
