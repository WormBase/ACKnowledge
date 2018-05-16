import React from 'react';
import {Button, Checkbox, Form, FormGroup, Panel} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import AlertDismissable from "../main_layout/AlertDismissable";

class Phenotypes extends React.Component {
    render() {
        return (
            <div>
                <AlertDismissable title="" text="Check any phenotype and functional data present in your
                paper. You can also provide additional information about the reference sentence in the paper."
                                  bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Phenotype data in your paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Allele Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info">
                                        Add details
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>RNAi Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info">
                                        Add details
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Transgene Overexpression Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info">
                                        Add details
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Chemical Induced Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <FormControl type="text" placeholder="Add details here"/>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Environmental Induced Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <FormControl type="text" placeholder="Add details here"/>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Functional data in your paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox>
                                    Protein Activity (i.e., Enzymatic Activity)
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"/>
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