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

        this.check_cb_allele = this.check_cb_allele.bind(this);
        this.toggle_cb_allele = this.toggle_cb_allele.bind(this);
        this.check_cb_rnai = this.check_cb_rnai.bind(this);
        this.toggle_cb_rnai = this.toggle_cb_rnai.bind(this);
        this.check_cb_transgene = this.check_cb_transgene.bind(this);
        this.toggle_cb_transgene = this.toggle_cb_transgene.bind(this);
        this.check_cb_protein = this.check_cb_protein.bind(this);
        this.toggle_cb_protein = this.toggle_cb_protein.bind(this);
        this.check_cb_chemical = this.check_cb_chemical.bind(this);
        this.toggle_cb_chemical = this.toggle_cb_chemical.bind(this);
        this.check_cb_env = this.check_cb_env.bind(this);
        this.toggle_cb_env = this.toggle_cb_env.bind(this);
    }

    check_cb_allele() {
        this.setState({cb_allele: true});
        this.props.svmAlleleChanged(true);
    }

    toggle_cb_allele() {
        let newVal = !this.state.cb_allele;
        this.setState({cb_allele: newVal});
        this.props.svmAlleleChanged(newVal);
    }

    check_cb_rnai() {
        this.setState({cb_rnai: true});
        this.props.svmRNAiChanged(true);
    }

    toggle_cb_rnai() {
        let newVal = !this.state.cb_rnai;
        this.setState({cb_rnai: newVal});
        this.props.svmRNAiChanged(newVal);
    }

    check_cb_transgene() {
        this.setState({cb_transgene: true});
        this.props.svmTransgeneChanged(true);
    }

    toggle_cb_transgene() {
        let newVal = !this.state.cb_transgene;
        this.setState({cb_transgene: newVal});
        this.props.svmTransgeneChanged(newVal);
    }

    check_cb_chemical() {
        this.setState({cb_chemical: true});
        this.props.chemicalChanged(true);
    }

    toggle_cb_chemical() {
        let newVal = !this.state.cb_chemical;
        this.setState({cb_chemical: newVal});
        this.props.chemicalChanged(newVal);
    }

    check_cb_env() {
        this.setState({cb_env: true});
        this.props.envChanged(true);
    }

    toggle_cb_env() {
        let newVal = !this.state.cb_env;
        this.setState({cb_env: newVal});
        this.props.envChanged(newVal);
    }

    check_cb_protein() {
        this.setState({cb_protein: true});
        this.props.svmProteinChanged(true);
    }

    toggle_cb_protein() {
        let newVal = !this.state.cb_protein;
        this.setState({cb_protein: newVal});
        this.props.svmProteinChanged(newVal);
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
                                              onClick={this.toggle_cb_allele}><strong>Allele Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info" onClick={this.check_cb_allele}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_rnai}
                                              onClick={this.toggle_cb_rnai}><strong>RNAi Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info" onClick={this.check_cb_rnai}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_transgene}
                                              onClick={this.toggle_cb_transgene}><strong>Transgene Overexpression Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsStyle="info" onClick={this.check_cb_transgene}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_chemical}
                                              onClick={this.toggle_cb_chemical}><strong>Chemical Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.state.cb_env}
                                              onClick={this.toggle_cb_env}><strong>Environmental Induced Phenotype</strong></Checkbox>
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
                                <Checkbox checked={this.state.cb_protein} onClick={this.toggle_cb_protein}>
                                    <strong>Protein Activity (i.e., Enzymatic Activity)</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={this.check_cb_protein}
                                             value={this.state.cb_protein_details}
                                             onChange={(event) => {
                                                 this.props.svmProteinDetailsChanged(event.target.value);
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