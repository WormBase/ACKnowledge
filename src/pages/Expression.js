import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, HelpBlock, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";

class Expression extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: '',
            active: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleOtherCheckChange = this.handleOtherCheckChange.bind(this);
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

        return (
            <div>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Categories Identified by Textpresso</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form horizontal>
                            <Checkbox defaultChecked>
                                Anatomic Expression data in WT condition <OverlayTrigger placement="top"
                                                                                         overlay={tooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger>
                            </Checkbox>
                            <Checkbox>
                                Site and Time of action data
                            </Checkbox>
                            <Checkbox>
                                Microarray data
                            </Checkbox>
                            <Checkbox>
                                RNAseq data
                            </Checkbox>
                            <br/>
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}>
                                <Col componentClass={ControlLabel} sm={2}>
                                    <Checkbox onChange={this.handleOtherCheckChange}>Add other</Checkbox>
                                </Col>
                                <Col componentClass={ControlLabel} sm={6}>
                                    <FormControl
                                        type="text"
                                        value={this.state.value}
                                        placeholder="Enter text"
                                        onChange={this.handleChange}
                                    />
                                    <FormControl.Feedback />
                                </Col>
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="primary" onClick={this.props.callback.bind(this, "expression")}>Next</Button>
                </div>
            </div>
        );
    }
}

export default Expression;