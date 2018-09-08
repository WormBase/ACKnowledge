import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, HelpBlock, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Expression extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: '',
            active: false,
            cb_anatomic: props["anatomicExpr"],
            cb_anatomic_details: props["anatomicExprDetails"],
            cb_site: props["siteAction"],
            cb_site_details: props["siteActionDetails"],
            cb_time: props["timeAction"],
            cb_time_details: props["timeActionDetails"],
            cb_rna: props["rnaSeq"],
            cb_rna_details: props["rnaSeqDetails"],
            additionalExpr: props["additionalExpr"]
        };

        this.check_cb_anatomic = this.check_cb_anatomic.bind(this);
        this.toggle_cb_anatomic = this.toggle_cb_anatomic.bind(this);
        this.check_cb_site = this.check_cb_site.bind(this);
        this.toggle_cb_site = this.toggle_cb_site.bind(this);
        this.check_cb_time = this.check_cb_time.bind(this);
        this.toggle_cb_time = this.toggle_cb_time.bind(this);
        this.check_cb_rna = this.check_cb_rna.bind(this);
        this.toggle_cb_rna = this.toggle_cb_rna.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleOtherCheckChange = this.handleOtherCheckChange.bind(this);
    }

    check_cb_anatomic() {
        this.setState({cb_anatomic: true});
        this.props.stateVarModifiedCallback(true, "anatomicExpr");
    }

    toggle_cb_anatomic() {
        let newVal = !this.state.cb_anatomic;
        this.setState({cb_anatomic: newVal});
        this.props.stateVarModifiedCallback(newVal, "anatomicExpr");
    }

    check_cb_site() {
        this.setState({cb_site: true});
        this.props.stateVarModifiedCallback(true, "siteAction");
    }

    toggle_cb_site() {
        let newVal = !this.state.cb_site;
        this.setState({cb_site: newVal});
        this.props.stateVarModifiedCallback(newVal, "siteAction");
    }

    check_cb_time() {
        this.setState({cb_time: true});
        this.props.stateVarModifiedCallback(true, "timeAction");
    }

    toggle_cb_time() {
        let newVal = !this.state.cb_time;
        this.setState({cb_time: newVal});
        this.props.stateVarModifiedCallback(newVal, "timeAction");
    }

    check_cb_rna() {
        this.setState({cb_rna: true});
        this.props.stateVarModifiedCallback(true, "rnaSeq");
    }

    toggle_cb_rna() {
        let newVal = !this.state.cb_rna;
        this.setState({cb_rna: newVal});
        this.props.stateVarModifiedCallback(newVal, "rnaSeq");
    }

    getValidationState() {
        if (this.state.active === true) {
            const length = this.state.value.length;
            if (length > 0) {
                return 'success';
            } else {
                return 'error';
            }
        } else {
            return '';
        }
    }

    handleOtherCheckChange(e) {
        this.setState({ active: e.target.checked });
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    setAnatomicExpr(anatomicExpr) {
        this.setState({
            cb_anatomic: anatomicExpr
        });
    }

    setAnatomicExprDetails(anatomicExprDetails) {
        this.setState({
            cb_anatomic_details: anatomicExprDetails
        });
    }

    setSiteAction(siteAction) {
        this.setState({
            cb_site: siteAction
        });
    }

    setSiteActionDetails(siteActionDetails) {
        this.setState({
            cb_site_details: siteActionDetails
        });
    }

    setTimeAction(timeAction) {
        this.setState({
            cb_time: timeAction
        });
    }

    setTimeActionDetails(timeActionDetails) {
        this.setState({
            cb_time_details: timeActionDetails
        });
    }

    setRnaSeq(rnaSeq) {
        this.setState({
            cb_rna: rnaSeq
        });
    }

    setRnaSeqDetails(rnaSeqDetails) {
        this.setState({
            cb_rna_details: rnaSeqDetails
        });
    }

    setAdditionalExpr(additionalExpr) {
        this.setState({
            additionalExpr: additionalExpr
        });
    }

    render() {
        const tooltip = (
            <Tooltip id="tooltip">
                go to interaction  section  to flag changes of expression level or localization in mutant background or
                upon treatment.
            </Tooltip>
        );

        return (
            <div>
                <AlertDismissable title="" text="Here you can find expression data that have
                been identified in your paper. Please select/deselect the appropriate checkboxes and add any additional
                information." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Expression data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <Checkbox checked={this.state.cb_anatomic} onClick={this.toggle_cb_anatomic}>
                                <strong>Anatomic Expression data in WT condition</strong> <OverlayTrigger placement="top"
                                                                                         overlay={tooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={this.check_cb_anatomic}
                                         value={this.state.cb_anatomic_details}
                                         onChange={(event) => {
                                             this.setAnatomicExprDetails(event.target.value);
                                             this.props.stateVarModifiedCallback(event.target.value, "anatomicExprDetails");
                                         }}
                            />
                            <Checkbox checked={this.state.cb_site} onClick={this.toggle_cb_site}>
                                <strong>Site of action data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={this.check_cb_site}
                                         value={this.state.cb_site_details}
                                         onChange={(event) => {
                                             this.props.stateVarModifiedCallback(event.target.value, "siteActionDetails");
                                             this.setSiteActionDetails(event.target.value);
                                         }}
                            />
                            <Checkbox checked={this.state.cb_time} onClick={this.toggle_cb_time}>
                                <strong>Time of action data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={this.check_cb_time}
                                         value={this.state.cb_time_details}
                                         onChange={(event) => {
                                             this.props.stateVarModifiedCallback(event.target.value, "timeActionDetails");
                                             this.setTimeActionDetails(event.target.value);
                                         }}
                            />
                            <Checkbox checked={this.state.cb_rna} onClick={this.toggle_cb_rna}>
                                <strong>RNAseq data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={this.check_cb_rna}
                                         value={this.state.cb_rna_details}
                                         onChange={(event) => {
                                             this.props.stateVarModifiedCallback(event.target.value, "rnaSeqDetails");
                                             this.setRnaSeqDetails(event.target.value);
                                         }}
                            />
                        </Form>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Microarrays</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <p>
                            WormBase regularly imports microarray data from Gene Expression Omnibus. Please submit your
                            microarray data to <a href="https://www.ncbi.nlm.nih.gov/geo/info/submission.html"
                                                  target={"_blank"}>GEO</a>
                        </p>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Add additional type of expression data &nbsp;
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form horizontal>
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}>
                                <Col componentClass={ControlLabel} sm={7}>
                                    <FormControl
                                        type="text"
                                        value={this.state.additionalExpr}
                                        placeholder="Add details here (e.g., qPCR, Proteomics)"
                                        onChange={(event) => {
                                            this.props.stateVarModifiedCallback(event.target.value, "additionalExpr");
                                            this.setAdditionalExpr(event.target.value);
                                        }}
                                    />
                                    <FormControl.Feedback />
                                </Col>
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "expression")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Expression;