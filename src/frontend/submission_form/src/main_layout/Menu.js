import React from 'react';
import {Nav, NavItem, OverlayTrigger, Tooltip} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import {MENU_INDEX, WIDGET, WIDGET_TITLE} from "../constants";
import {useDispatch, useSelector} from "react-redux";
import {setSelectedWidget} from "../redux/actions/widgetActions";

const Menu = ({urlQuery}) => {
    const dispatch = useDispatch();

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
            <div className="panel panel-default" style={{marginBottom: '10px'}}>
                <div className="panel-body">
                    <Nav bsStyle="pills" stacked onSelect={(sel) => dispatch(setSelectedWidget(sel))}>
                        <IndexLinkContainer to={WIDGET.OVERVIEW + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.OVERVIEW]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.OVERVIEW]}>
                                <MenuItemWithIcon widget="overview" title={WIDGET_TITLE[WIDGET.OVERVIEW]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.GENETICS + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.GENETICS]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.GENETICS]}>
                                <MenuItemWithIcon widget="genetics" title={WIDGET_TITLE[WIDGET.GENETICS]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.REAGENT + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.REAGENT]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.REAGENT]}>
                                <MenuItemWithIcon widget="reagent" title={WIDGET_TITLE[WIDGET.REAGENT]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.EXPRESSION + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.EXPRESSION]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.EXPRESSION]}>
                                <MenuItemWithIcon widget="expression" title={WIDGET_TITLE[WIDGET.EXPRESSION]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.INTERACTIONS + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.INTERACTIONS]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.INTERACTIONS]}>
                                <MenuItemWithIcon widget="interactions" title={WIDGET_TITLE[WIDGET.INTERACTIONS]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.PHENOTYPES + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.PHENOTYPES]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.PHENOTYPES]}>
                                <MenuItemWithIcon widget="phenotypes" title={WIDGET_TITLE[WIDGET.PHENOTYPES]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.DISEASE + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.DISEASE]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.DISEASE]}>
                                <MenuItemWithIcon widget="disease" title={WIDGET_TITLE[WIDGET.DISEASE]} />
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.COMMENTS + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.COMMENTS]}>
                            <NavItem eventKey={MENU_INDEX[WIDGET.COMMENTS]}>
                                <MenuItemWithIcon widget="comments" title={WIDGET_TITLE[WIDGET.COMMENTS]} />
                            </NavItem>
                        </IndexLinkContainer>
                    </Nav>
                </div>
            </div>
            
            <div className="panel panel-default">
                <div className="panel-body">
                    <Nav bsStyle="pills" stacked onSelect={(sel) => dispatch(setSelectedWidget(sel))}>
                        <IndexLinkContainer to={WIDGET.ABOUT + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.ABOUT]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.ABOUT]}>{WIDGET_TITLE[WIDGET.ABOUT]}
                            </NavItem></IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.HELP + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.HELP]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.HELP]}>{WIDGET_TITLE[WIDGET.HELP]}
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
                                eventKey={MENU_INDEX[WIDGET.RELEASE_NOTES]}>{WIDGET_TITLE[WIDGET.RELEASE_NOTES]}
                            </NavItem></IndexLinkContainer>
                    </Nav>
                </div>
            </div>
        </div>
    );
}

export default Menu;