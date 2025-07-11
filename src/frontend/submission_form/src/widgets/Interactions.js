import React from 'react';
import {
    Button, Checkbox, FormControl, FormGroup, Form,
    Panel, Tooltip, Image, OverlayTrigger
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {
    setGeneticInteractions,
    setPhysicalInteractions, setRegulatoryInteractions,
    toggleGeneticInteractions, togglePhysicalInteractions, toggleRegulatoryInteractions
} from "../redux/actions/interactionsActions";
import {useDispatch, useSelector} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import {WIDGET} from "../constants";
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";

const Interactions = () => {
    const dispatch = useDispatch();
    const geneint = useSelector((state) => state.interactions.geneint);
    const genereg = useSelector((state) => state.interactions.genereg);
    const geneprod = useSelector((state) => state.interactions.geneprod);
    const isSavedToDB = useSelector((state) => state.interactions.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

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
                saved={isSavedToDB}
            />
            <div style={{marginBottom: '15px', textAlign: 'right'}}>
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    let payload = {
                        gene_int: getCheckboxDBVal(geneint.checked, geneint.details),
                        phys_int: getCheckboxDBVal(geneprod.checked, geneprod.details),
                        gene_reg: getCheckboxDBVal(genereg.checked, genereg.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetDataSilently(payload, WIDGET.INTERACTIONS));
                }}>
                    <Glyphicon glyph="cloud-upload" style={{marginRight: '6px'}} />
                    Save current progress
                </Button>
            </div>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Interaction data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <FormGroup>
                            <Checkbox checked={geneint.checked} onClick={() => dispatch(toggleGeneticInteractions())}>
                                <strong>Genetic Interactions</strong> <OverlayTrigger placement="top" overlay={geneticIntTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => dispatch(setGeneticInteractions(true, geneint.details))}
                                         value={geneint.details}
                                         onChange={(event) => {
                                             dispatch(setGeneticInteractions(true, event.target.value));
                                         }}/>
                            <Checkbox checked={geneprod.checked} onClick={() => dispatch(togglePhysicalInteractions())}>
                                <strong>Physical Interactions</strong> <OverlayTrigger placement="top" overlay={physicalIntTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => dispatch(setPhysicalInteractions(true, geneprod.details))}
                                         value={geneprod.details}
                                         onChange={(event) => {
                                             dispatch(setPhysicalInteractions(true, event.target.value));
                                         }}/>
                            <Checkbox checked={genereg.checked} onClick={() => dispatch(toggleRegulatoryInteractions())}>
                                <strong>Regulatory Interactions</strong> <OverlayTrigger placement="top" overlay={regulatoryIntTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => dispatch(setRegulatoryInteractions(true, genereg.details))}
                                         value={genereg.details}
                                         onChange={(event) => {
                                             dispatch(setRegulatoryInteractions(true, event.target.value));
                                         }}/>
                            <FormControl.Feedback />
                        </FormGroup>
                    </Form>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    let payload = {
                        gene_int: getCheckboxDBVal(geneint.checked, geneint.details),
                        phys_int: getCheckboxDBVal(geneprod.checked, geneprod.details),
                        gene_reg: getCheckboxDBVal(genereg.checked, genereg.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.INTERACTIONS));
                }}>Save and go to next section
                </Button>
            </div>
        </div>
    );
}

export default Interactions;