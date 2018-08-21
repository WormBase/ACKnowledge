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
        this.state = {
            value: '',
            active: false,
            cb_orthologs: props["orthologs"],
            cb_transgenic: props["transgenic"],
            cb_modifiers: props["modifiers"],
            comments: props["comments"]
        };

        this.check_cb_orthologs = this.check_cb_orthologs.bind(this);
        this.check_cb_transgenic = this.check_cb_transgenic.bind(this);
        this.check_cb_modifiers = this.check_cb_modifiers.bind(this);
    }

    check_cb_orthologs() {
        this.setState({cb_orthologs: true});
        this.props.orthologsExprCallback(true);
    }

    toggle_cb_orthologs() {
        let newVal = !this.state.cb_orthologs;
        this.setState({cb_orthologs: newVal});
        this.props.orthologsExprCallback(newVal);
    }

    check_cb_transgenic() {
        this.setState({cb_transgenic: true});
        this.props.transgenicExprCallback(true);
    }

    toggle_cb_transgenic() {
        let newVal = !this.state.cb_transgenic;
        this.setState({cb_transgenic: newVal});
        this.props.transgenicExprCallback(newVal);
    }

    check_cb_modifiers() {
        this.setState({cb_modifiers: true});
        this.props.modifiersExprCallback(true);
    }

    toggle_cb_modifiers() {
        let newVal = !this.state.cb_modifiers;
        this.setState({cb_modifiers: newVal});
        this.props.modifiersExprCallback(newVal);
    }

    render() {
        const tooltip = (
            <Tooltip id="tooltip">
                go to interaction  section  to flag changes of expression level or localization in mutant background or
                upon treatment.
            </Tooltip>
        );
        const expressionTooltip = (
            <Tooltip id="expressionTooltip"> More text
            </Tooltip>
        );

        return (
            <div>
                <AlertDismissable title="" text="Here you can find disease data that have
                been identified in your paper. If this paper reports a disease model, please choose one or more that it
                describes." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Disease data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <Checkbox checked={this.state.cb_orthologs} onClick={this.toggle_cb_orthologs}>
                                <strong>Worm ortholog/s of human disease relevant gene</strong>
                            </Checkbox>
                            <Checkbox checked={this.state.cb_transgenic} onClick={this.toggle_cb_transgenic}>
                                <strong>Transgenic studies with either human (or worm) disease relevant gene</strong>
                            </Checkbox>
                            <Checkbox checked={this.state.cb_modifiers} onClick={this.toggle_cb_modifiers}>
                                <strong>Modifiers of a new or previously established disease model (eg., drugs, herbals, chemicals, etc)</strong>
                            </Checkbox>
                        </Form>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Additional comments on disease models
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
                                                 onChange={(event) => {
                                                     this.props.commentsCallback(event.target.value);
                                                     this.setOther(event.target.value);
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