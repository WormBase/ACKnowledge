import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock,
    Panel
} from "react-bootstrap";

class Overview extends React.Component {
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
        return (
            <div>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Genes identified in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-5">
                                        <label>Add more genes</label>
                                    </div>
                                    <div className="col-sm-2">
                                    </div>
                                    <div className="col-sm-5">
                                        <label>Identified genes</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <FormControl componentClass="select" multiple>
                                            <option value="select">select (multiple)</option>
                                            <option value="other">...</option>
                                        </FormControl>

                                    </div>
                                    <div className="col-sm-2" align="center">
                                        <ButtonGroup className="align-middle">
                                            <Button bsSize="small">
                                                <Glyphicon glyph="chevron-right" />
                                            </Button>
                                            <br/><br/>
                                            <Button bsSize="small">
                                                <Glyphicon glyph="chevron-left" />
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                    <div className="col-sm-5">
                                        <FormControl componentClass="select" multiple>
                                            <option value="select">select (multiple)</option>
                                            <option value="other">...</option>
                                        </FormControl>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <label>Filter by autocompletion</label>
                                        <input className="form-control"/>
                                    </div>
                                    <div className="col-sm-2">
                                    </div>
                                    <div className="col-sm-5">
                                        <label>Filter by autocompletion</label>
                                        <input className="form-control"/>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Species identified in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <Checkbox defaultChecked>
                                C. elegans
                            </Checkbox>
                            <Checkbox defaultChecked>
                                C. briggsae
                            </Checkbox>
                            <label>Search for more species</label>
                            <input className="form-control"/>
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}>
                                <ControlLabel>Add new species</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.value}
                                    placeholder="Enter text"
                                    onChange={this.handleChange}
                                />
                                <FormControl.Feedback />
                                <HelpBlock>Validation is based on string length.</HelpBlock>
                            </FormGroup>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="primary" onClick={this.props.callback.bind(this, "overview")}>Next</Button>
                </div>
            </div>
        );
    }
}

export default Overview;