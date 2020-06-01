import React from 'react';
import {
    Button, Checkbox, FormControl, FormGroup, Form,
    Panel, Tooltip, Image, OverlayTrigger
} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";
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
import {setLoading, showDataSaved, unsetLoading} from "../redux/actions/displayActions";
import {DataManager} from "../lib/DataManager";
import Glyphicon from "react-bootstrap/lib/Glyphicon";

class Interactions extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            dataManager: new DataManager()
        };
    }

    render() {
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
                    saved={this.props.isSavedToDB}
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Interaction data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox checked={this.props.geneint.checked} onClick={() => this.props.toggleGeneticInteractions()}>
                                    <strong>Genetic Interactions</strong> <OverlayTrigger placement="top" overlay={geneticIntTooltip}>
                                    <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setGeneticInteractions(true, this.props.geneint.details)}
                                             value={this.props.geneint.details}
                                             onChange={(event) => {
                                                 this.props.setGeneticInteractions(true, event.target.value);
                                             }}/>
                                <Checkbox checked={this.props.geneprod.checked} onClick={() => this.props.togglePhysicalInteractions()}>
                                    <strong>Physical Interactions</strong> <OverlayTrigger placement="top" overlay={physicalIntTooltip}>
                                    <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setPhysicalInteractions(true, this.props.geneprod.details)}
                                             value={this.props.geneprod.details}
                                             onChange={(event) => {
                                                 this.props.setPhysicalInteractions(true, event.target.value);
                                             }}/>
                                <Checkbox checked={this.props.genereg.checked} onClick={() => this.props.toggleRegulatoryInteractions()}>
                                    <strong>Regulatory Interactions</strong> <OverlayTrigger placement="top" overlay={regulatoryIntTooltip}>
                                    <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setRegulatoryInteractions(true, this.props.genereg.details)}
                                             value={this.props.genereg.details}
                                             onChange={(event) => {
                                                 this.props.setRegulatoryInteractions(true, event.target.value);
                                             }}/>
                                <FormControl.Feedback />
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={() => {
                        let payload = {
                            gene_int: getCheckboxDBVal(this.props.geneint.checked, this.props.geneint.details),
                            phys_int: getCheckboxDBVal(this.props.geneprod.checked, this.props.geneprod.details),
                            gene_reg: getCheckboxDBVal(this.props.genereg.checked, this.props.genereg.details)
                        };
                        this.props.setLoading();
                        this.state.dataManager.postWidgetData(payload)
                            .then(() => {
                                this.props.setIsInteractionsSavedToDB();
                                this.props.showDataSaved(true, false);
                            })
                            .catch((error) => {
                                this.props.showDataSaved(false, false);
                            }).finally(() => this.props.unsetLoading());
                        }}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    geneint: getGeneticInteractions(state),
    geneprod: getPhysicalInteractions(state),
    genereg: getRegulatoryInteractions(state),
    isSavedToDB: isInteractionsSavedToDB(state)
});

export default connect(mapStateToProps, {setGeneticInteractions, toggleGeneticInteractions, setPhysicalInteractions,
    togglePhysicalInteractions, setRegulatoryInteractions, toggleRegulatoryInteractions, showDataSaved,
    setIsInteractionsSavedToDB, setLoading, unsetLoading})(Interactions);