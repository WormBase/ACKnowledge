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

const Phenotypes = (props) => {

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
                saved={props.isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Phenotype data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={props.allelePheno.checked}
                                          onClick={() => props.toggleAllelePhenotype()}>
                                    <strong>Allele Phenotype</strong> <OverlayTrigger placement="top"
                                                                                      overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                    props.setAllelePhenotype(true, '');
                                    window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                }}>
                                    Add details in online form
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={props.rnaiPheno.checked}
                                          onClick={() => props.toggleRnaiPhenotype()}>
                                    <strong>RNAi Phenotype</strong> <OverlayTrigger placement="top"
                                                                                    overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                    props.setRnaiPhenotype(true, '');
                                    window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                }}>
                                    Add details in online form
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={props.overexprPheno.checked}
                                          onClick={() => props.toggleOverexprPhenotype()}>
                                    <strong>Transgene Overexpression Phenotype</strong> <OverlayTrigger placement="top"
                                                                                                        overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                    props.setOverexprPhenotype(true, '')
                                    window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                }}>
                                    Add details in online form
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={props.chemPheno.checked}
                                          onClick={() => props.toggleChemicalPhenotype()}><strong>Chemical Induced Phenotype</strong></Checkbox>
                            </div>
                            <div className="col-sm-5">
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={props.envPheno.checked}
                                          onClick={() => props.toggleEnvironmentalPhenotype()}><strong>Environmental Induced Phenotype</strong></Checkbox>
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
                            <Checkbox checked={props.enzymaticAct.checked} onClick={() => props.toggleEnzymaticActivity()}>
                                <strong>Enzymatic Activity</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => props.setEnzymaticActivity(true, props.enzymaticAct.details)}
                                         value={props.enzymaticAct.details}
                                         onChange={(event) => {
                                             props.setEnzymaticActivity(true, event.target.value);
                                         }}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                        <FormGroup>
                            <Checkbox checked={props.othergenefunc.checked} onClick={() => props.toggleOthergenefunc()}>
                                <strong>Other Gene Function</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => props.setOthergenefunc(true, props.othergenefunc.details)}
                                         value={props.othergenefunc.details}
                                         onChange={(event) => {
                                             props.setOthergenefunc(true, event.target.value);
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
                        allele_pheno: getCheckboxDBVal(props.allelePheno.checked),
                        rnai_pheno: getCheckboxDBVal(props.rnaiPheno.checked),
                        transover_pheno: getCheckboxDBVal(props.overexprPheno.checked),
                        chemical: getCheckboxDBVal(props.chemPheno.checked),
                        env: getCheckboxDBVal(props.envPheno.checked),
                        protein: getCheckboxDBVal(props.enzymaticAct.checked, props.enzymaticAct.details),
                        othergenefunc: getCheckboxDBVal(props.othergenefunc.checked, props.othergenefunc.details),
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.PHENOTYPES);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
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