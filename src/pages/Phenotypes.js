import React from 'react';
import {Button, Checkbox, Form, FormGroup, Image, OverlayTrigger, Panel, Tooltip} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import AlertDismissable from "../main_layout/AlertDismissable";

class Phenotypes extends React.Component {
    constructor(props, context) {
        super(props, context);
        let alertTitleNotSaved = "";
        let alertTitleSaved = "Well done!";
        let alertTitle = alertTitleNotSaved;
        if (props["saved"]) {
            alertTitle = alertTitleSaved;
        }
        let alertTextNotSaved = "Here you can find phenotype and functional data that have been identified in your " +
            "paper. Please select/deselect the appropriate checkboxes and add any additional information.";
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
            cb_allele: props["cb_allele"],
            cb_rnai: props["cb_rnai"],
            cb_transgene: props["cb_transgene"],
            cb_protein: props["cb_protein"],
            cb_protein_details: props["cb_protein_details"],
            cb_chemical: props["cb_chemical"],
            cb_env: props["cb_env"],
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
        this.selfStateVarModifiedFunction = this.selfStateVarModifiedFunction.bind(this);
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
        const svmTooltip = (
            <Tooltip id="tooltip">
                This field is prepopulated by Textpresso Central.
            </Tooltip>
        );
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
                        <Panel.Title componentClass="h3">Phenotype data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_allele}
                                              onClick={() => this.toggle_cb("cb_allele", "svmAllele")}>
                                        <strong>Allele Phenotype</strong> <OverlayTrigger placement="top"
                                                                                          overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        this.check_cb("cb_allele", "svmAllele");
                                        window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                    }}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_rnai}
                                              onClick={() => this.toggle_cb("cb_rnai", "svmRNAi")}>
                                        <strong>RNAi Phenotype</strong> <OverlayTrigger placement="top"
                                                                                        overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        this.check_cb("cb_rnai", "svmRNAi");
                                        window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                    }}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_transgene}
                                              onClick={() => this.toggle_cb("cb_transgene", "svmTransgene")}>
                                        <strong>Transgene Overexpression Phenotype</strong> <OverlayTrigger placement="top"
                                                                                                            overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        this.check_cb("cb_transgene", "svmTransgene");
                                        window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                    }}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_chemical}
                                              onClick={() => this.toggle_cb("cb_chemical", "chemical")}><strong>Chemical Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_env}
                                              onClick={() => this.toggle_cb("cb_env", "env")}><strong>Environmental Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Functional data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox checked={this.state.cb_protein} onClick={() => this.toggle_cb("cb_protein", "svmProtein")}>
                                    <strong>Protein Activity (i.e., Enzymatic Activity)</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.check_cb("cb_protein", "svmProtein")}
                                             value={this.state.cb_protein_details}
                                             onChange={(event) => {
                                                 this.props.stateVarModifiedCallback(event.target.value, "svmProteinDetails");
                                                 this.selfStateVarModifiedFunction(event.target.value, "cb_protein_details");
                                             }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "phenotypes")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Phenotypes;