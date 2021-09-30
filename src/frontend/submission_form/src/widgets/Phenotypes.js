import React from 'react';
import {Button, Checkbox, Form, FormGroup, Image, OverlayTrigger, Panel, Tooltip} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import InstructionsAlert from "../components/InstructionsAlert";
import {
    setAllelePhenotype,
    setEnzymaticActivity,
    setOthergenefunc,
    setOverexprPhenotype,
    setRnaiPhenotype,
    toggleAllelePhenotype,
    toggleChemicalPhenotype,
    toggleEnvironmentalPhenotype,
    toggleEnzymaticActivity,
    toggleOthergenefunc,
    toggleOverexprPhenotype,
    toggleRnaiPhenotype
} from "../redux/actions/phenotypesActions";
import {getCheckboxDBVal} from "../AFPValues";
import {WIDGET} from "../constants";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {useDispatch, useSelector} from "react-redux";

const Phenotypes = () => {
    const dispatch = useDispatch();
    const allelePheno = useSelector((state) => state.phenotypes.allelePheno);
    const rnaiPheno = useSelector((state) => state.phenotypes.rnaiPheno);
    const overexprPheno = useSelector((state) => state.phenotypes.overexprPheno);
    const chemPheno = useSelector((state) => state.phenotypes.chemPheno);
    const envPheno = useSelector((state) => state.phenotypes.envPheno);
    const enzymaticAct = useSelector((state) => state.phenotypes.enzymaticAct);
    const othergenefunc = useSelector((state) => state.phenotypes.othergenefunc);
    const isSavedToDB = useSelector((state) => state.phenotypes.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

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
                saved={isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Phenotype data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={allelePheno.checked}
                                          onClick={() => dispatch(toggleAllelePhenotype())}>
                                    <strong>Allele Phenotype</strong> <OverlayTrigger placement="top"
                                                                                      overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                    dispatch(setAllelePhenotype(true, ''));
                                    window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                }}>
                                    Add details in online form
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={rnaiPheno.checked}
                                          onClick={() => dispatch(toggleRnaiPhenotype())}>
                                    <strong>RNAi Phenotype</strong> <OverlayTrigger placement="top"
                                                                                    overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                    dispatch(setRnaiPhenotype(true, ''));
                                    window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                }}>
                                    Add details in online form
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={overexprPheno.checked}
                                          onClick={() => dispatch(toggleOverexprPhenotype())}>
                                    <strong>Transgene Overexpression Phenotype</strong> <OverlayTrigger placement="top"
                                                                                                        overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                    dispatch(setOverexprPhenotype(true, ''))
                                    window.open("https://wormbase.org/submissions/phenotype.cgi", "_blank");
                                }}>
                                    Add details in online form
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={chemPheno.checked}
                                          onClick={() => dispatch(toggleChemicalPhenotype())}><strong>Chemical Induced Phenotype</strong></Checkbox>
                            </div>
                            <div className="col-sm-5">
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <Checkbox checked={envPheno.checked}
                                          onClick={() => dispatch(toggleEnvironmentalPhenotype())}><strong>Environmental Induced Phenotype</strong></Checkbox>
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
                            <Checkbox checked={enzymaticAct.checked} onClick={() => dispatch(toggleEnzymaticActivity())}>
                                <strong>Enzymatic Activity</strong> <OverlayTrigger placement="top" overlay={svmTooltip}>
                                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => dispatch(setEnzymaticActivity(true, enzymaticAct.details))}
                                         value={enzymaticAct.details}
                                         onChange={(event) => {
                                             dispatch(setEnzymaticActivity(true, event.target.value));
                                         }}
                            />
                            <FormControl.Feedback />
                        </FormGroup>
                        <FormGroup>
                            <Checkbox checked={othergenefunc.checked} onClick={() => dispatch(toggleOthergenefunc())}>
                                <strong>Other Gene Function</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => dispatch(setOthergenefunc(true, othergenefunc.details))}
                                         value={othergenefunc.details}
                                         onChange={(event) => {
                                             dispatch(setOthergenefunc(true, event.target.value));
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
                        allele_pheno: getCheckboxDBVal(allelePheno.checked),
                        rnai_pheno: getCheckboxDBVal(rnaiPheno.checked),
                        transover_pheno: getCheckboxDBVal(overexprPheno.checked),
                        chemical: getCheckboxDBVal(chemPheno.checked),
                        env: getCheckboxDBVal(envPheno.checked),
                        protein: getCheckboxDBVal(enzymaticAct.checked, enzymaticAct.details),
                        othergenefunc: getCheckboxDBVal(othergenefunc.checked, othergenefunc.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.PHENOTYPES));
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

export default Phenotypes;
