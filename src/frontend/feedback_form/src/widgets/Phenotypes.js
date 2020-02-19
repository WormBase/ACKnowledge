import React from 'react';
import {Button, Checkbox, Form, FormGroup, Image, OverlayTrigger, Panel, Tooltip} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {
    getAllelePhenotype,
    getChemicalPhenotype, getEnvironmentalPhenotype, getEnzymaticActivity, getOverexprPhenotype,
    getRnaiPhenotype,
    isPhenotypesSavedToDB
} from "../redux/selectors/phenotypesSelectors";
import {
    setAllelePhenotype,
    setChemicalPhenotype,
    setEnvironmentalPhenotype,
    setEnzymaticActivity,
    setOverexprPhenotype,
    setRnaiPhenotype,
    toggleAllelePhenotype,
    toggleChemicalPhenotype,
    toggleEnvironmentalPhenotype,
    toggleEnzymaticActivity,
    toggleOverexprPhenotype,
    toggleRnaiPhenotype
} from "../redux/actions/phenotypesActions";
import {connect} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";

class Phenotypes extends React.Component {

    render() {
        const svmTooltip = (
            <Tooltip id="tooltip">
                This field is prepopulated by Textpresso Central.
            </Tooltip>
        );
        return (
            <div>
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="Here you can find phenotype and functional data that have been identified in
                    your paper. Please select/deselect the appropriate checkboxes and add any additional information."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.props.isSavedToDB}
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Phenotype data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.props.allelePheno.checked}
                                              onClick={() => this.props.toggleAllelePhenotype()}>
                                        <strong>Allele Phenotype</strong> <OverlayTrigger placement="top"
                                                                                          overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        this.props.setAllelePhenotype(true, '');
                                        window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                    }}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.props.rnaiPheno.checked}
                                              onClick={() => this.props.toggleRnaiPhenotype()}>
                                        <strong>RNAi Phenotype</strong> <OverlayTrigger placement="top"
                                                                                        overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        this.props.setRnaiPhenotype(true, '');
                                        window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                    }}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.props.overexprPheno.checked}
                                              onClick={() => this.props.toggleOverexprPhenotype()}>
                                        <strong>Transgene Overexpression Phenotype</strong> <OverlayTrigger placement="top"
                                                                                                            overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        this.props.setOverexprPhenotype(true, '')
                                        window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                    }}>
                                        Add details in online form
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.props.chemPheno.checked}
                                              onClick={() => this.props.toggleChemicalPhenotype()}><strong>Chemical Induced Phenotype</strong></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-7">
                                    <Checkbox checked={this.props.envPheno.checked}
                                              onClick={() => this.props.toggleEnvironmentalPhenotype()}><strong>Environmental Induced Phenotype</strong></Checkbox>
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
                                <Checkbox checked={this.props.enzymaticAct.checked} onClick={() => this.props.toggleEnzymaticActivity()}>
                                    <strong>Enzymatic Activity</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.check_cb("cb_protein", "svmProtein")}
                                             value={this.props.enzymaticAct.details}
                                             onChange={(event) => {
                                                 this.props.setEnzymaticActivity(true, event.target.value);
                                             }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={() => {
                        let payload = {
                            allele_pheno: getCheckboxDBVal(this.props.allelePheno.checked),
                            rnai_pheno: getCheckboxDBVal(this.props.rnaiPheno.checked),
                            transover_pheno: getCheckboxDBVal(this.props.overexprPheno.checked),
                            chemical: getCheckboxDBVal(this.props.chemPheno.checked),
                            env: getCheckboxDBVal(this.props.envPheno.checked),
                            protein: getCheckboxDBVal(this.props.enzymaticAct.checked, this.props.enzymaticAct.details),
                        };
                        this.state.dataManager.postWidgetData(payload)
                            .then(this.props.showDataSaved(true, false))
                            .catch(this.props.showDataSaved(false, false));
                    }}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    allelePheno: getAllelePhenotype(state),
    rnaiPheno: getRnaiPhenotype(state),
    overexprPheno: getOverexprPhenotype(state),
    chemPheno: getChemicalPhenotype(state),
    envPheno: getEnvironmentalPhenotype(state),
    enzymaticAct: getEnzymaticActivity(state),
    isSavedToDB: isPhenotypesSavedToDB(state)
});

export default connect(mapStateToProps, {setAllelePhenotype,
    toggleAllelePhenotype, setRnaiPhenotype, toggleRnaiPhenotype, setOverexprPhenotype, toggleOverexprPhenotype,
    setChemicalPhenotype, toggleChemicalPhenotype, setEnvironmentalPhenotype, toggleEnvironmentalPhenotype,
    setEnzymaticActivity, toggleEnzymaticActivity, showDataSaved})(Phenotypes);