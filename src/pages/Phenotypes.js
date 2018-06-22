import React from 'react';
import {Button, Checkbox, Form, FormGroup, Panel} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import AlertDismissable from "../main_layout/AlertDismissable";

class Phenotypes extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            cb_allele: false,
            cb_rnai: false,
            cb_transgene: false,
            cb_protein: false
        };

        this.check_cb_allele = this.check_cb_allele.bind(this);
        this.toggle_cb_allele = this.toggle_cb_allele.bind(this);
        this.check_cb_rnai = this.check_cb_rnai.bind(this);
        this.toggle_cb_rnai = this.toggle_cb_rnai.bind(this);
        this.check_cb_transgene = this.check_cb_transgene.bind(this);
        this.toggle_cb_transgene = this.toggle_cb_transgene.bind(this);
        this.check_cb_protein = this.check_cb_protein.bind(this);
        this.toggle_cb_protein = this.toggle_cb_protein.bind(this);
    }

    check_cb_allele() {
        this.setState({cb_allele: true});
    }

    toggle_cb_allele() {
        this.setState({cb_allele: !this.state.cb_allele});
    }

    check_cb_rnai() {
        this.setState({cb_rnai: true});
    }

    toggle_cb_rnai() {
        this.setState({cb_rnai: !this.state.cb_rnai});
    }

    check_cb_transgene() {
        this.setState({cb_transgene: true});
    }

    toggle_cb_transgene() {
        this.setState({cb_transgene: !this.state.cb_transgene});
    }

    check_cb_protein() {
        this.setState({cb_protein: true});
    }

    toggle_cb_protein() {
        this.setState({cb_protein: !this.state.cb_protein});
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
                                    <Checkbox><strong>Chemical Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox><strong>Environmental Induced Phenotype</strong></Checkbox>
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
                                <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_protein}/>
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