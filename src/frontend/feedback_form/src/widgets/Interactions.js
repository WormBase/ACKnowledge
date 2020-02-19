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
    setGeneticInteractions,
    setPhysicalInteractions, setRegulatoryInteractions,
    toggleGeneticInteractions, togglePhysicalInteractions, toggleRegulatoryInteractions
} from "../redux/actions/interactionsActions";
import {connect} from "react-redux";

class Interactions extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    setSuccessAlertMessage() {
        this.alertDismissable.setSaved(true);
    }

    render() {
        const svmTooltip = (
            <Tooltip id="tooltip">
                This field is prepopulated by Textpresso Central.
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
                    ref={instance => { this.alertDismissable = instance; }}
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Interaction data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox checked={this.props.geneint.checked} onClick={() => this.props.toggleGeneticInteractions()}>
                                    <strong>Genetic Interactions</strong> <OverlayTrigger placement="top"
                                                                                          overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setGeneticInteractions(true, '')}
                                             value={this.props.geneint.details}
                                             onChange={(event) => {
                                                 this.props.setGeneticInteractions(true, event.target.value);
                                             }}/>
                                <Checkbox checked={this.props.geneprod.checked} onClick={() => this.props.togglePhysicalInteractions()}>
                                    <strong>Physical Interactions</strong> <OverlayTrigger placement="top"
                                                                                           overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setPhysicalInteractions(true, '')}
                                             value={this.props.geneprod.details}
                                             onChange={(event) => {
                                                 this.props.setPhysicalInteractions(true, event.target.value);
                                             }}/>
                                <Checkbox checked={this.props.genereg.checked} onClick={() => this.props.toggleGeneticInteractions()}>
                                    <strong>Regulatory Interactions</strong> <OverlayTrigger placement="top"
                                                                                             overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setRegulatoryInteractions(true, '')}
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
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "interactions")}>Save and continue
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
    togglePhysicalInteractions, setRegulatoryInteractions, toggleRegulatoryInteractions})(Interactions);