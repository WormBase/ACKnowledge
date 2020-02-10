import React from 'react';
import {
    Button, Checkbox, FormControl, FormGroup, Form,
    Panel, Tooltip, Image, OverlayTrigger
} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";

class Interactions extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            saved: props["saved"],
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
                    saved={this.state.saved}
                    ref={instance => { this.alertDismissable = instance; }}
                />
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
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
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
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
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
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
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