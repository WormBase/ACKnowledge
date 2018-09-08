import React from 'react';
import {Button, Checkbox, Form, FormGroup, Panel} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import AlertDismissable from "../main_layout/AlertDismissable";

class Phenotypes extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            cb_allele: props["cb_allele"],
            cb_rnai: props["cb_rnai"],
            cb_transgene: props["cb_transgene"],
            cb_protein: props["cb_protein"],
            cb_protein_details: props["cb_protein_details"],
            cb_chemical: props["cb_chemical"],
            cb_env: props["cb_env"]
        };

        this.check_cb = props["checkCb"].bind(this);
        this.toggle_cb = props["toggleCb"].bind(this);
    }

    set_cb_protein_details(details) {
        this.setState({
            cb_protein_details: details
        });
    }

    render() {
        return (
            <div>
                <AlertDismissable title="" text="Here you can find phenotype and functional data that have
                been identified in your paper. Please select/deselect the appropriate checkboxes and add any additional
                information."
                                  bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Phenotype data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_allele}
                                              onClick={() => this.toggle_cb("cb_allele", "svmAllele")}><strong>Allele Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info" onClick={() => this.check_cb("cb_allele", "svmAllele")}
                                            href={"https://wormbase.org/submissions/phenotype.cgi"} target="_blank">
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_rnai}
                                              onClick={() => this.toggle_cb("cb_rnai", "svmRNAi")}><strong>RNAi Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info" onClick={() => this.check_cb("cb_rnai", "svmRNAi")}
                                            href={"https://wormbase.org/submissions/phenotype.cgi"} target="_blank">
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_transgene}
                                              onClick={() => this.toggle_cb("cb_transgene", "svmTransgene")}><strong>Transgene Overexpression Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info" onClick={() => this.check_cb("cb_transgene", "svmTransgene")}
                                            href={"https://wormbase.org/submissions/phenotype.cgi"} target="_blank">
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_chemical}
                                              onClick={() => this.toggle_cb("cb_chemical", "chemical")}><strong>Chemical Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_env}
                                              onClick={() => this.toggle_cb("cb_env", "env")}><strong>Environmental Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Functional data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox checked={this.state.cb_protein} onClick={() => this.toggle_cb("cb_protein", "svmProtein")}>
                                    <strong>Protein Activity (i.e., Enzymatic Activity)</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.check_cb("cb_protein", "svmProtein")}
                                             value={this.state.cb_protein_details}
                                             onChange={(event) => {
                                                 this.props.stateVarModifiedCallback(event.target.value, "svmProteinDetails");
                                                 this.set_cb_protein_details(event.target.value);
                                             }}
                                />
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