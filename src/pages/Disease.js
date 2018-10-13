import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Form, FormControl, Panel
} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";

class Disease extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            saved: props["saved"],
            active: false,
            humDis: props["humDis"],
            comments: props["comments"]
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

        return (
            <div>
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="If this paper reports a disease model, please choose one or more that it describes."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.state.saved}
                    ref={instance => { this.alertDismissable = instance; }}
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Disease model data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <Checkbox checked={this.state.humDis} onClick={() => this.toggle_cb("humDis", "humDis")}>
                                <strong>The paper contains one of the following:</strong>
                            </Checkbox>
                            <ul>
                                <li><strong>Worm ortholog/s of human disease relevant gene</strong></li>
                                <li><strong>Transgenic studies with either human (or worm) disease relevant gene</strong></li>
                                <li><strong>Modifiers of a new or previously established disease model (eg., drugs, herbals, chemicals, etc)</strong></li>
                            </ul>
                        </Form>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Additional comments on disease models in the paper
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    Write comments here
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl componentClass="textarea" multiple
                                                 value={this.state.comments}
                                                 onClick={() => this.check_cb("humDis", "humDis")}
                                                 onChange={(event) => {
                                                     this.props.stateVarModifiedCallback(event.target.value, "disComments");
                                                     this.selfStateVarModifiedFunction(event.target.value, "comments");
                                                 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "disease")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Disease;