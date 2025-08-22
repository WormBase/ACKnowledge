import React from 'react';
import {Button, Checkbox, Form, FormGroup, Glyphicon, Image, OverlayTrigger, Panel, Tooltip} from "react-bootstrap";
import FormControl from "react-bootstrap/es/FormControl";
import InstructionsAlert from "../components/InstructionsAlert";
import AutoDetectedBadge from "../components/AutoDetectedBadge";
import {
    setAllelePhenotype, setChemicalPhenotype, setEnvironmentalPhenotype,
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
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";
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
            <div style={{marginBottom: '15px', textAlign: 'center'}}>
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    let payload = {
                        allele_pheno: getCheckboxDBVal(allelePheno.checked),
                        rnai_pheno: getCheckboxDBVal(rnaiPheno.checked),
                        transover_pheno: getCheckboxDBVal(overexprPheno.checked),
                        chemical: getCheckboxDBVal(chemPheno.checked, chemPheno.details),
                        env: getCheckboxDBVal(envPheno.checked, envPheno.details),
                        protein: getCheckboxDBVal(enzymaticAct.checked, enzymaticAct.details),
                        othergenefunc: getCheckboxDBVal(othergenefunc.checked, othergenefunc.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetDataSilently(payload, WIDGET.PHENOTYPES));
                }}>
                    <Glyphicon glyph="cloud-upload" style={{marginRight: '6px'}} />
                    Save current progress
                </Button>
            </div>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Phenotype data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <div className="container-fluid">
                        <div className="row" style={{display: 'flex', alignItems: 'center'}}>
                            <div className="col-sm-7">
                                <Checkbox checked={allelePheno.checked}
                                          onClick={() => dispatch(toggleAllelePhenotype())}>
                                    <strong>Allele Phenotype</strong> <AutoDetectedBadge/></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <a 
                                    href="https://wormbase.org/submissions/phenotype.cgi" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '13px',
                                        color: '#0066cc',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid #0066cc',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.color = '#004499';
                                        e.target.style.borderBottomColor = '#004499';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.color = '#0066cc';
                                        e.target.style.borderBottomColor = '#0066cc';
                                    }}
                                    onClick={() => dispatch(setAllelePhenotype(true, ''))}
                                >
                                    Add details in online form <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                                </a>
                            </div>
                        </div>
                        <div className="row" style={{display: 'flex', alignItems: 'center'}}>
                            <div className="col-sm-7">
                                <Checkbox checked={rnaiPheno.checked}
                                          onClick={() => dispatch(toggleRnaiPhenotype())}>
                                    <strong>RNAi Phenotype</strong> <AutoDetectedBadge/></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <a 
                                    href="https://wormbase.org/submissions/phenotype.cgi" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '13px',
                                        color: '#0066cc',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid #0066cc',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.color = '#004499';
                                        e.target.style.borderBottomColor = '#004499';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.color = '#0066cc';
                                        e.target.style.borderBottomColor = '#0066cc';
                                    }}
                                    onClick={() => dispatch(setRnaiPhenotype(true, ''))}
                                >
                                    Add details in online form <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                                </a>
                            </div>
                        </div>
                        <div className="row" style={{display: 'flex', alignItems: 'center'}}>
                            <div className="col-sm-7">
                                <Checkbox checked={overexprPheno.checked}
                                          onClick={() => dispatch(toggleOverexprPhenotype())}>
                                    <strong>Transgene Overexpression Phenotype</strong> <AutoDetectedBadge/></Checkbox>
                            </div>
                            <div className="col-sm-5">
                                <a 
                                    href="https://wormbase.org/submissions/phenotype.cgi" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '13px',
                                        color: '#0066cc',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid #0066cc',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.color = '#004499';
                                        e.target.style.borderBottomColor = '#004499';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.color = '#0066cc';
                                        e.target.style.borderBottomColor = '#0066cc';
                                    }}
                                    onClick={() => dispatch(setOverexprPhenotype(true, ''))}
                                >
                                    Add details in online form <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                                </a>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-7">
                                <FormGroup>
                                    <Checkbox checked={chemPheno.checked} onClick={() => dispatch(toggleChemicalPhenotype())}>
                                        <strong>Chemical Induced Phenotype</strong>
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Add details here"
                                                 onClick={() => dispatch(setChemicalPhenotype(true, chemPheno.details))}
                                                 value={chemPheno.details}
                                                 onChange={(event) => {
                                                     dispatch(setChemicalPhenotype(true, event.target.value));
                                                 }}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <FormGroup>
                                    <Checkbox checked={envPheno.checked} onClick={() => dispatch(toggleEnvironmentalPhenotype())}>
                                        <strong>Environmental Induced Phenotype</strong>
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Add details here"
                                                 onClick={() => dispatch(setEnvironmentalPhenotype(true, envPheno.details))}
                                                 value={envPheno.details}
                                                 onChange={(event) => {
                                                     dispatch(setEnvironmentalPhenotype(true, event.target.value));
                                                 }}
                                    />
                                    <FormControl.Feedback />
                                </FormGroup>
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
                                <strong>Enzymatic Activity</strong> <AutoDetectedBadge/>
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
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    let payload = {
                        allele_pheno: getCheckboxDBVal(allelePheno.checked),
                        rnai_pheno: getCheckboxDBVal(rnaiPheno.checked),
                        transover_pheno: getCheckboxDBVal(overexprPheno.checked),
                        chemical: getCheckboxDBVal(chemPheno.checked, chemPheno.details),
                        env: getCheckboxDBVal(envPheno.checked, envPheno.details),
                        protein: getCheckboxDBVal(enzymaticAct.checked, enzymaticAct.details),
                        othergenefunc: getCheckboxDBVal(othergenefunc.checked, othergenefunc.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.PHENOTYPES));
                }}>Save and go to next section
                </Button>
            </div>
        </div>
    );
}

export default Phenotypes;
