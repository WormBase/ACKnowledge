import React from 'react';
import {Button, FormControl, Image, Panel} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Other extends React.Component {
    constructor(props, context) {
        super(props, context);
        let alertTitleNotSaved = "";
        let alertTitleSaved = "Well done!";
        let alertTitle = alertTitleNotSaved;
        if (props["saved"]) {
            alertTitle = alertTitleSaved;
        }
        let alertTextNotSaved = "In this page you can update your contact info, submit your unpublished data to " +
            "microPublicationsend, send comments to the WormBase team and finalize the data submission process.";
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
            other: props["other"],
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
        return (
            <div>
                <AlertDismissable
                    title={this.state.alertTitle}
                    text={this.state.alertText}
                    bsStyle={this.state.alertBsStyle}
                    ref={instance => { this.alertDismissable = instance; }}
                />
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Update contact info and lineage
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        Thank you for filling out the form, as a last step please check that your
                                        contact info and lineage are up to date by clicking on the button below
                                    </div>
                                </div>
                                <br/>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                                href={"http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/person_lineage.cgi?action=Display&number"}
                                                target={"_blank"}>
                                            Update contact info and lineage</Button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Do you have additional unpublished data?
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="row">
                                <div className="col-sm-10">
                                    If you have unpublished data generated during this study, we encourage you to
                                    submit it at <a href="https://www.micropublication.org" target="_blank">
                                    micropublication.org</a>
                                </div>
                                <div className="col-sm-2">
                                    <a href="https://www.micropublication.org" target="_blank">
                                        <Image src="micropub_logo.png" responsive/>
                                    </a>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Have we missed anything? Do you have any comments?
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
                                                     value={this.state.other}
                                                     onChange={(event) => {
                                                         this.props.stateVarModifiedCallback(event.target.value, "other");
                                                         this.selfStateVarModifiedFunction(event.target.value, "other");
                                                     }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "contact_info")}>Finish and submit
                    </Button>
                </div>
            </div>
        );
    }
}

export default Other;