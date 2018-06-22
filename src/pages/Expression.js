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
            cb_anatomic: true,
            cb_site: false,
            cb_rna: false
        };

        this.check_cb_anatomic = this.check_cb_anatomic.bind(this);
        this.toggle_cb_anatomic = this.toggle_cb_anatomic.bind(this);
        this.check_cb_site = this.check_cb_site.bind(this);
        this.toggle_cb_site = this.toggle_cb_site.bind(this);
        this.check_cb_rna = this.check_cb_rna.bind(this);
        this.toggle_cb_rna = this.toggle_cb_rna.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleOtherCheckChange = this.handleOtherCheckChange.bind(this);
    }

    check_cb_anatomic() {
        this.setState({cb_anatomic: true});
    }

    toggle_cb_anatomic() {
        this.setState({cb_anatomic: !this.state.cb_anatomic});
    }

    check_cb_site() {
        this.setState({cb_site: true});
    }

    toggle_cb_site() {
        this.setState({cb_site: !this.state.cb_site});
    }

    check_cb_rna() {
        this.setState({cb_rna: true});
    }

    toggle_cb_rna() {
        this.setState({cb_rna: !this.state.cb_rna});
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
                            <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_anatomic}/>
                            <Checkbox checked={this.state.cb_site} onClick={this.toggle_cb_site}>
                                <strong>Site and Time of action data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_site}/>
                            <Checkbox checked={this.state.cb_rna} onClick={this.toggle_cb_rna}>
                                <strong>RNAseq data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_rna}/>
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
                            microarray data to <a href="https://www.ncbi.nlm.nih.gov/geo/info/submission.html">GEO</a>
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
                                        value={this.state.value}
                                        placeholder="Add details here (e.g., qPCR, Proteomics)"
                                        onChange={this.handleChange}
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