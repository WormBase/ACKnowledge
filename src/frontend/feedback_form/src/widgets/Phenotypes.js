import React from 'react';
import {Button, Checkbox, Form, FormGroup, Image, OverlayTrigger, Panel, Tooltip} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {
    getAllelePhenotype,
    getChemicalPhenotype, getEnvironmentalPhenotype, getEnzymaticActivity, getOthergenefunc, getOverexprPhenotype,
    getRnaiPhenotype,
    isPhenotypesSavedToDB
} from "../redux/selectors/phenotypesSelectors";
import {
    setAllelePhenotype,
    setChemicalPhenotype,
    setEnvironmentalPhenotype,
    setEnzymaticActivity, setIsPhenotypesSavedToDB, setOthergenefunc,
    setOverexprPhenotype,
    setRnaiPhenotype,
    toggleAllelePhenotype,
    toggleChemicalPhenotype,
    toggleEnvironmentalPhenotype,
    toggleEnzymaticActivity, toggleOthergenefunc,
    toggleOverexprPhenotype,
    toggleRnaiPhenotype
} from "../redux/actions/phenotypesActions";
import {connect} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";

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
                                             onClick={() => this.props.setEnzymaticActivity(true, this.props.enzymaticAct.details)}
                                             value={this.props.enzymaticAct.details}
                                             onChange={(event) => {
                                                 this.props.setEnzymaticActivity(true, event.target.value);
                                             }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                            <FormGroup>
                                <Checkbox checked={this.props.othergenefunc.checked} onClick={() => this.props.toggleOthergenefunc()}>
                                    <strong>Other Gene Function</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"
                                             onClick={() => this.props.setOthergenefunc(true, this.props.othergenefunc.details)}
                                             value={this.props.othergenefunc.details}
                                             onChange={(event) => {
                                                 this.props.setOthergenefunc(true, event.target.value);
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
                            othergenefunc: getCheckboxDBVal(this.props.othergenefunc.checked, this.props.othergenefunc.details),
                            passwd: this.props.paperPasswd
                        };
                        this.props.saveWidgetData(payload, WIDGET.PHENOTYPES);
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
    othergenefunc: getOthergenefunc(state),
    isSavedToDB: isPhenotypesSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {setAllelePhenotype,
    toggleAllelePhenotype, setRnaiPhenotype, toggleRnaiPhenotype, setOverexprPhenotype, toggleOverexprPhenotype,
    setChemicalPhenotype, toggleChemicalPhenotype, setEnvironmentalPhenotype, toggleEnvironmentalPhenotype,
    setEnzymaticActivity, toggleEnzymaticActivity, setOthergenefunc, toggleOthergenefunc, showDataSaved,
    setIsPhenotypesSavedToDB, saveWidgetData})(Phenotypes);