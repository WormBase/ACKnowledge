import React from 'react';
import {Button, ButtonGroup, Checkbox, Form, FormControl, FormGroup, Glyphicon, Panel} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Reagent extends React.Component {
    render() {
        return (
            <div>
                <AlertDismissable title="" text="Here you can find transgenes and antobodies that have
                been identified from your paper. Please validate the list as for the previous section. You can also
                submit a new allele name and indicate an allele sequence change." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Transgenes in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-5">
                                        <label>Add new transgenes</label>
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
                                        <label>Search WormBase transgene list</label>
                                        <input className="form-control"/>
                                    </div>
                                    <div className="col-sm-2">
                                    </div>
                                    <div className="col-sm-5">
                                        <label>Search transgene list</label>
                                        <input className="form-control"/>
                                    </div>
                                </div>
                                <br/>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button bsStyle="info">
                                            Submit New Transgene Name
                                        </Button>
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
                            <Form>
                                <FormGroup>
                                    <Checkbox>
                                        Antibodies are mentioned in the paper
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Add details here"/>
                                    <Checkbox>
                                        Antibodies are generated in the paper
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Add details here"/>
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Form>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "reagent")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Reagent;