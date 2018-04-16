import React from 'react';
import {Button, ButtonGroup, Checkbox, FormControl, Glyphicon, Panel} from "react-bootstrap";

class Reagent extends React.Component {
    render() {
        return (
            <div>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Transgenes identified in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-5">
                                        <label>Add more transgenes</label>
                                    </div>
                                    <div className="col-sm-2">
                                    </div>
                                    <div className="col-sm-5">
                                        <label>Identified transgenes</label>
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
                                <br/>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <button>Submit New Transgene Name</button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Antibodies</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div>
                                            <Checkbox>Antibodies are mentioned in the paper</Checkbox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="primary" onClick={this.props.callback.bind(this, "reagent")}>Next</Button>
                </div>
            </div>
        );
    }
}

export default Reagent;