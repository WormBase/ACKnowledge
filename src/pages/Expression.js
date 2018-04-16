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
            value: ''
        };

        this.handleChange = this.handleChange.bind(this);
    }

    getValidationState() {
        const length = this.state.value.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
        return null;
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
                                    Add other
                                </Col>
                                <Col componentClass={ControlLabel} sm={6}>
                                    <FormControl
                                        type="text"
                                        value={this.state.value}
                                        placeholder="Enter text"
                                        onChange={this.handleChange}
                                    />
                                    <FormControl.Feedback />
                                    <HelpBlock>Validation is based on string length.</HelpBlock>
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