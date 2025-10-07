import React, {useState} from 'react';
import {Nav, NavItem, OverlayTrigger, Tooltip} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import {MENU_INDEX, WIDGET, WIDGET_TITLE} from "../constants";
import {useDispatch, useSelector} from "react-redux";
import {setSelectedWidget, saveWidgetData} from "../redux/actions/widgetActions";
import {withRouter} from "react-router-dom";
import UnsavedChangesModal from "../components/modals/UnsavedChangesModal";

const Menu = ({urlQuery, onMenuItemClick = () => {}, history}) => {
    const dispatch = useDispatch();
    const selectedWidget = useSelector((state) => state.widget.selectedWidget);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // Utility function to check if a widget has changes
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

    // Get widget state name from menu index
    const getWidgetStateName = (menuIndex) => {
        const widgetMap = {
            [MENU_INDEX[WIDGET.OVERVIEW]]: 'overview',
            [MENU_INDEX[WIDGET.GENETICS]]: 'genetics',
            [MENU_INDEX[WIDGET.REAGENT]]: 'reagent',
            [MENU_INDEX[WIDGET.EXPRESSION]]: 'expression',
            [MENU_INDEX[WIDGET.INTERACTIONS]]: 'interactions',
            [MENU_INDEX[WIDGET.PHENOTYPES]]: 'phenotypes',
            [MENU_INDEX[WIDGET.DISEASE]]: 'disease',
            [MENU_INDEX[WIDGET.COMMENTS]]: 'comments'
        };
        return widgetMap[menuIndex] || null;
    };

    // Get widget title from menu index
    const getWidgetTitle = (menuIndex) => {
        const reverseMap = Object.keys(MENU_INDEX).find(key => MENU_INDEX[key] === menuIndex);
        return reverseMap ? WIDGET_TITLE[reverseMap] : '';
    };

    // Get current widget state
    const currentWidgetState = useSelector((state) => {
        const widgetName = getWidgetStateName(selectedWidget);
        return widgetName ? state[widgetName] : null;
    });

    // Handle navigation attempt
    const handleNavigationAttempt = (targetMenuIndex, targetPath) => {
        const hasChanges = hasWidgetChanges(currentWidgetState);

        // If no unsaved changes, navigate directly
        if (!hasChanges) {
            dispatch(setSelectedWidget(targetMenuIndex));
            history.push(targetPath + urlQuery);
            onMenuItemClick();
            window.scrollTo(0, 0);
            return;
        }

        // Show modal for unsaved changes
        setPendingNavigation({
            menuIndex: targetMenuIndex,
            path: targetPath
        });
        setShowUnsavedModal(true);
    };

    // Handle save and continue
    const handleSaveAndContinue = () => {
        const widgetName = getWidgetStateName(selectedWidget);
        if (widgetName && pendingNavigation) {
            dispatch(saveWidgetData(widgetName));
            // Wait a moment for save to process, then navigate
            setTimeout(() => {
                dispatch(setSelectedWidget(pendingNavigation.menuIndex));
                history.push(pendingNavigation.path + urlQuery);
                onMenuItemClick();
                window.scrollTo(0, 0);
                setShowUnsavedModal(false);
                setPendingNavigation(null);
            }, 500);
        }
    };

    // Handle continue without saving
    const handleContinueWithoutSaving = () => {
        if (pendingNavigation) {
            dispatch(setSelectedWidget(pendingNavigation.menuIndex));
            history.push(pendingNavigation.path + urlQuery);
            onMenuItemClick();
            window.scrollTo(0, 0);
            setShowUnsavedModal(false);
            setPendingNavigation(null);
        }
    };

    // Handle cancel navigation
    const handleCancelNavigation = () => {
        setShowUnsavedModal(false);
        setPendingNavigation(null);
    };

    // Reusable menu item component
    const MenuItemWithIcon = ({ widget, title, children }) => {
        const widgetState = useSelector((state) => state[widget]);
        const isSaved = widgetState && widgetState.isSavedToDB;
        const hasChanges = hasWidgetChanges(widgetState);

        const icon = isSaved ? 
            <OverlayTrigger placement="right" overlay={<Tooltip id={`${widget}-tooltip`}>Section saved</Tooltip>}>
                <Glyphicon glyph="ok" style={{color: 'green'}}/>
            </OverlayTrigger> :
            hasChanges ?
            <OverlayTrigger placement="right" overlay={<Tooltip id={`${widget}-tooltip`}>Section has unsaved changes</Tooltip>}>
                <Glyphicon glyph="pencil" style={{color: 'orange'}}/>
            </OverlayTrigger> : 
            null;

        return (
            <>
                {title}&nbsp;{icon}
                {children}
            </>
        );
    };

    return (
        <div>
            <UnsavedChangesModal
                show={showUnsavedModal}
                onHide={handleCancelNavigation}
                onSaveAndContinue={handleSaveAndContinue}
                onContinueWithoutSaving={handleContinueWithoutSaving}
                currentWidget={getWidgetTitle(selectedWidget)}
                targetWidget={pendingNavigation ? getWidgetTitle(pendingNavigation.menuIndex) : ''}
            />
            <div className="panel panel-default" style={{marginBottom: '10px'}}>
                <div className="panel-body">
                    <Nav bsStyle="pills" stacked>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.OVERVIEW]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.OVERVIEW], WIDGET.OVERVIEW);
                            }}
                        >
                            <MenuItemWithIcon widget="overview" title={WIDGET_TITLE[WIDGET.OVERVIEW]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.GENETICS]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.GENETICS], WIDGET.GENETICS);
                            }}
                        >
                            <MenuItemWithIcon widget="genetics" title={WIDGET_TITLE[WIDGET.GENETICS]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.REAGENT]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.REAGENT], WIDGET.REAGENT);
                            }}
                        >
                            <MenuItemWithIcon widget="reagent" title={WIDGET_TITLE[WIDGET.REAGENT]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.EXPRESSION]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.EXPRESSION], WIDGET.EXPRESSION);
                            }}
                        >
                            <MenuItemWithIcon widget="expression" title={WIDGET_TITLE[WIDGET.EXPRESSION]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.INTERACTIONS]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.INTERACTIONS], WIDGET.INTERACTIONS);
                            }}
                        >
                            <MenuItemWithIcon widget="interactions" title={WIDGET_TITLE[WIDGET.INTERACTIONS]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.PHENOTYPES]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.PHENOTYPES], WIDGET.PHENOTYPES);
                            }}
                        >
                            <MenuItemWithIcon widget="phenotypes" title={WIDGET_TITLE[WIDGET.PHENOTYPES]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.DISEASE]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.DISEASE], WIDGET.DISEASE);
                            }}
                        >
                            <MenuItemWithIcon widget="disease" title={WIDGET_TITLE[WIDGET.DISEASE]} />
                        </NavItem>
                        <NavItem
                            active={selectedWidget === MENU_INDEX[WIDGET.COMMENTS]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigationAttempt(MENU_INDEX[WIDGET.COMMENTS], WIDGET.COMMENTS);
                            }}
                        >
                            <MenuItemWithIcon widget="comments" title={WIDGET_TITLE[WIDGET.COMMENTS]} />
                        </NavItem>
                    </Nav>
                </div>
            </div>
            
            <div className="panel panel-default">
                <div className="panel-body">
                    <Nav bsStyle="pills" stacked onSelect={(sel) => dispatch(setSelectedWidget(sel))}>
                        <IndexLinkContainer to={WIDGET.ABOUT + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.ABOUT]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.ABOUT]} onClick={onMenuItemClick}>{WIDGET_TITLE[WIDGET.ABOUT]}
                            </NavItem></IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.HELP + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.HELP]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.HELP]} onClick={onMenuItemClick}>{WIDGET_TITLE[WIDGET.HELP]}
                            </NavItem></IndexLinkContainer>
                        <NavItem href="https://www.youtube.com/embed/ZONK4qe_-w8?start=86&end=1011" target="_blank">
                            WormBase Community Curation Webinar <Glyphicon glyph="new-window"/>
                        </NavItem>
                        <NavItem href="mailto:help.acknowledge@wormbase.org">
                            Contact us <Glyphicon glyph="envelope"/>
                        </NavItem>
                        <IndexLinkContainer to={WIDGET.RELEASE_NOTES + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.RELEASE_NOTES]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.RELEASE_NOTES]} onClick={onMenuItemClick}>{WIDGET_TITLE[WIDGET.RELEASE_NOTES]}
                            </NavItem></IndexLinkContainer>
                    </Nav>
                </div>
            </div>
        </div>
    );
}

export default withRouter(Menu);