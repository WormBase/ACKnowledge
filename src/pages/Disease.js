import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, HelpBlock, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Disease extends React.Component {
    constructor(props, context) {
        super(props, context);
        let alertTitleNotSaved = "";
        let alertTitleSaved = "Well done!";
        let alertTitle = alertTitleNotSaved;
        if (props["saved"]) {
            alertTitle = alertTitleSaved;
        }
        let alertTextNotSaved = "If this paper reports a disease model, please choose one or more that it describes.";
        let alertTextSaved = "The data for this page has been saved, you can modify it any time.";
        let alertText = alertTextNotSaved;
        if (props["saved"]) {
            alertText = alertTextSaved;
        }
        let alertBsStyleNotSaved = "info";
        let alertBsStyleSaved = "success";
        let alertBsStyle = alertBsStyleNotSaved;
        if (props["saved"]) {
            alertBsStyle = alertBsStyleSaved;
        }
        this.state = {
            value: '',
            active: false,
            humDis: props["humDis"],
            comments: props["comments"],
            alertText: alertText,
            alertTitle: alertTitle,
            alertBsStyle: alertBsStyle,
            alertTextNotSaved: alertTextNotSaved,
            alertTextSaved: alertTextSaved,
            alertTitleNotSaved: alertTitleNotSaved,
            alertTitleSaved: alertTitleSaved,
            alertBsStyleNotSaved: alertBsStyleNotSaved,
            alertBsStyleSaved: alertBsStyleSaved
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
        this.alertDismissable.selfStateVarModifiedFunction(this.state.alertTitleSaved, "title");
        this.alertDismissable.selfStateVarModifiedFunction(this.state.alertTextSaved, "text");
        this.alertDismissable.selfStateVarModifiedFunction(this.state.alertBsStyleSaved, "bsStyle");
    }

    render() {

        return (
            <div>
                <AlertDismissable
                    title={this.state.alertTitle}
                    text={this.state.alertText}
                    bsStyle={this.state.alertBsStyle}
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