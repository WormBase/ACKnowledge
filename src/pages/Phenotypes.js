import React from 'react';
import {Button, Checkbox, Form, Panel} from "react-bootstrap";

class Phenotypes extends React.Component {
    render() {
        return (
            <div>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Categories Identified by Textpresso</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Allele Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <button>Enter Data</button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>RNAi Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <button>Enter Data</button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Transgene Overexpression Phenotype</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <button>Enter Data</button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Chemical or Other Environmental Perturbations</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox>Protein Activity (i.e., Enzymatic Activity)</Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="primary" onClick={this.props.callback.bind(this, "phenotypes")}>Next</Button>
                </div>
            </div>
        );
    }
}

export default Phenotypes;