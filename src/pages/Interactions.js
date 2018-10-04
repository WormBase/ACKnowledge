import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Form,
    Panel, Col, Tooltip, Image, OverlayTrigger
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Interactions extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            cb_genetic: props["cb_genetic"],
            cb_genetic_details: props['cb_genetic_details'],
            cb_physical: props["cb_physical"],
            cb_physical_details: props['cb_physical_details'],
            cb_regulatory: props["cb_regulatory"],
            cb_regulatory_details: props['cb_regulatory_details']
        };

        this.check_cb = props["checkCb"].bind(this);
        this.toggle_cb = props["toggleCb"].bind(this);
    }

    selfStateVarModifiedFunction(value, stateVarName) {
        let stateElem = {};
        stateElem[stateVarName] = value;
        this.setState(stateElem);
    }

    render() {
        const svmTooltip = (
            <Tooltip id="tooltip">
                This checkbox has been pre-populated based on our SVM classification system.
            </Tooltip>
        );
        return (
            <div>
                <AlertDismissable title="" text="Here you can find interaction data that have
                been identified in your paper. Please select/deselect the appropriate checkboxes and add any additional
                information." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Interaction data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox checked={this.state.cb_genetic} onClick={() => this.toggle_cb("cb_genetic", "svmGeneInt")}>
                                    <strong>Genetic Interactions</strong> <OverlayTrigger placement="top"
                                                                                          overlay={svmTooltip}>
                                    <Image src="svm_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.check_cb("cb_genetic", "svmGeneInt")}
                                             value={this.state.cb_genetic_details}
                                             onChange={(event) => {
                                                 this.props.stateVarModifiedCallback(event.target.value, "svmGeneIntDetails");
                                                 this.selfStateVarModifiedFunction(event.target.value, "cb_genetic_details");
                                             }}/>
                                <Checkbox checked={this.state.cb_physical} onClick={() => this.toggle_cb("cb_physical", "svmPhysInt")}>
                                    <strong>Physical Interactions</strong> <OverlayTrigger placement="top"
                                                                                           overlay={svmTooltip}>
                                    <Image src="svm_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.check_cb("cb_physical", "svmPhysInt")}
                                             value={this.state.cb_physical_details}
                                             onChange={(event) => {
                                                 this.props.stateVarModifiedCallback(event.target.value, "svmPhysIntDetails");
                                                 this.selfStateVarModifiedFunction(event.target.value, "cb_physical_details");
                                             }}/>
                                <Checkbox checked={this.state.cb_regulatory} onClick={() => this.toggle_cb("cb_regulatory", "svmGeneReg")}>
                                    <strong>Regulatory Interactions</strong> <OverlayTrigger placement="top"
                                                                                             overlay={svmTooltip}>
                                    <Image src="svm_powered.svg" width="80px"/></OverlayTrigger>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.check_cb("cb_regulatory", "svmGeneReg")}
                                             value={this.state.cb_regulatory_details}
                                             onChange={(event) => {
                                                 this.props.stateVarModifiedCallback(event.target.value, "svmGeneRegDetails");
                                                 this.selfStateVarModifiedFunction(event.target.value, "cb_regulatory_details");
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

export default Interactions;