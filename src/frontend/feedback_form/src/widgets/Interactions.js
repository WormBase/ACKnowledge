import React from 'react';
import {
    Button, Checkbox, FormControl, FormGroup, Form,
    Panel, Tooltip, Image, OverlayTrigger
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {
    getGeneticInteractions,
    getPhysicalInteractions,
    getRegulatoryInteractions, isInteractionsSavedToDB
} from "../redux/selectors/interactionsSelectors";
import {
    setGeneticInteractions, setIsInteractionsSavedToDB,
    setPhysicalInteractions, setRegulatoryInteractions,
    toggleGeneticInteractions, togglePhysicalInteractions, toggleRegulatoryInteractions
} from "../redux/actions/interactionsActions";
import {connect} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Interactions = (props) => {

    const svmTooltip = (
        <Tooltip id="tooltip">
            This field is prepopulated by Textpresso Central.
        </Tooltip>
    );
    const geneticIntTooltip = (
        <Tooltip id="tooltip">
            Genetic interactions refer to observations of phenotype modifications and/or a double mutant (or
            double genetic perturbation) phenotype that deviates from the expected phenotype based on single
            perturbation phenotypes, assuming the genes act independently.
        </Tooltip>
    );
    const regulatoryIntTooltip = (
        <Tooltip id="tooltip">
            Regulatory interactions refer to observations of various perturbations (genetic or environmental)
            affecting the expression of a gene and/or the localization of a gene product.
        </Tooltip>
    );
    const physicalIntTooltip = (
        <Tooltip id="tooltip">
            Physical interactions represent molecular associations between C. elegans genes and gene products
            (protein-protein, DNA-protein, RNA-protein). Please don’t include chemical-gene interactions and
            inter-species interactions.
        </Tooltip>
    );
    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="Here you can find interaction data that have been identified in your paper.
                    Please select/deselect the appropriate checkboxes and add any additional information."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={props.isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Interaction data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <FormGroup>
                            <Checkbox checked={props.geneint.checked} onClick={() => props.toggleGeneticInteractions()}>
                                <strong>Genetic Interactions</strong> <OverlayTrigger placement="top" overlay={geneticIntTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => props.setGeneticInteractions(true, props.geneint.details)}
                                         value={props.geneint.details}
                                         onChange={(event) => {
                                             props.setGeneticInteractions(true, event.target.value);
                                         }}/>
                            <Checkbox checked={props.geneprod.checked} onClick={() => props.togglePhysicalInteractions()}>
                                <strong>Physical Interactions</strong> <OverlayTrigger placement="top" overlay={physicalIntTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => props.setPhysicalInteractions(true, props.geneprod.details)}
                                         value={props.geneprod.details}
                                         onChange={(event) => {
                                             props.setPhysicalInteractions(true, event.target.value);
                                         }}/>
                            <Checkbox checked={props.genereg.checked} onClick={() => props.toggleRegulatoryInteractions()}>
                                <strong>Regulatory Interactions</strong> <OverlayTrigger placement="top" overlay={regulatoryIntTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => props.setRegulatoryInteractions(true, props.genereg.details)}
                                         value={props.genereg.details}
                                         onChange={(event) => {
                                             props.setRegulatoryInteractions(true, event.target.value);
                                         }}/>
                            <FormControl.Feedback />
                        </FormGroup>
                    </Form>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    let payload = {
                        gene_int: getCheckboxDBVal(props.geneint.checked, props.geneint.details),
                        phys_int: getCheckboxDBVal(props.geneprod.checked, props.geneprod.details),
                        gene_reg: getCheckboxDBVal(props.genereg.checked, props.genereg.details),
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.INTERACTIONS);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    geneint: getGeneticInteractions(state),
    geneprod: getPhysicalInteractions(state),
    genereg: getRegulatoryInteractions(state),
    isSavedToDB: isInteractionsSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {setGeneticInteractions, toggleGeneticInteractions, setPhysicalInteractions,
    togglePhysicalInteractions, setRegulatoryInteractions, toggleRegulatoryInteractions, showDataSaved,
    setIsInteractionsSavedToDB, saveWidgetData})(Interactions);