import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import AutoDetectedBadge from "../components/AutoDetectedBadge";
import {useDispatch, useSelector} from "react-redux";
import {
    setAdditionalExpr,
    setExpression,
    setSiteOfAction,
    setTimeOfAction,
    toggleExpression,
    toggleSiteOfAction,
    toggleTimeOfAction,
    toggleAdditionalExpr
} from "../redux/actions/expressionActions";
import {getCheckboxDBVal} from "../AFPValues";
import {WIDGET} from "../constants";
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";

const Expression = () =>{
    const dispatch = useDispatch();
    const expression = useSelector((state) => state.expression.expression);
    const siteOfAction = useSelector((state) => state.expression.siteOfAction);
    const timeOfAction = useSelector((state) => state.expression.timeOfAction);
    const additionalExpr = useSelector((state) => state.expression.additionalExpr);
    const isSavedToDB = useSelector((state) => state.expression.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);


    const tooltip = (
        <Tooltip id="tooltip">
            go to interaction  section  to flag changes of expression level or localization in mutant background or
            upon treatment.
        </Tooltip>
    );

    const siteTooltip = (
        <Tooltip id="tooltip">
            In what tissue is a specific gene to carry out its
            function? This can be demonstrated by phenotype rescue using a
            tissue-specific exogenous promoter, a tissue-specific knock down of gene
            function or other similar experiments. Gene expression data alone is insufficient to indicate site/time
            of action pertaining to a specific phenotype. We encourage authors to refer to a specific piece of text
            from their publication in the text box provided.
        </Tooltip>
    );

    const timeTooltip = (
        <Tooltip id="tooltip">
            At what time is a specific gene to carry out its
            function? This can be demonstrated by phenotype rescue using a
            lifestage-specific exogenous promoter, a temperature-shift experiment
            with a temperature-sensitive allele or other similar experiments. Gene expression data alone is
            insufficient to indicate site/time of action pertaining to a specific phenotype. We encourage authors
            to refer to a specific piece of text from their publication in the text box provided.
        </Tooltip>
    );
    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="Here you can find expression data that have been identified in your paper. Please
                    select/deselect the appropriate checkboxes and add any additional information."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Expression data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <div className="container-fluid">
                        <Form>
                        <Checkbox checked={expression.checked} onClick={() => dispatch(toggleExpression())}>
                            <strong>Anatomic Expression data in WT condition</strong> <OverlayTrigger placement="top"
                                                                                                      overlay={tooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger> <AutoDetectedBadge/>
                        </Checkbox>
                        <FormControl type="text" placeholder="E.g.: unc-47 is expressed in GABAergic motor neurons."
                                     onClick={() => dispatch(setExpression(true, expression.details))}
                                     value={expression.details}
                                     onChange={(event) => {
                                         dispatch(setExpression(true, event.target.value));
                                     }}
                        />
                        <Checkbox checked={siteOfAction.checked} onClick={() => dispatch(toggleSiteOfAction())}>
                            <strong>Site of action data</strong> <OverlayTrigger placement="top"
                                                                                 overlay={siteTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger>
                        </Checkbox>
                        <FormControl type="text" placeholder="E.g.: Expressing AVR-14 specifically in AVA sufficed to rescue AVA inhibition following tail stimulation."
                                     onClick={() => dispatch(setSiteOfAction(true, siteOfAction.details))}
                                     value={siteOfAction.details}
                                     onChange={(event) => {
                                         dispatch(setSiteOfAction(true, event.target.value));
                                     }}
                        />
                        <Checkbox checked={timeOfAction.checked} onClick={() => dispatch(toggleTimeOfAction())}>
                            <strong>Time of action data</strong> <OverlayTrigger placement="top"
                                                                                 overlay={timeTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger>
                        </Checkbox>
                        <FormControl type="text" placeholder="E.g.: CDK-4 regulates size during L3 larval stage in seam cells."
                                     onClick={() => dispatch(setTimeOfAction(true, timeOfAction.details))}
                                     value={timeOfAction.details}
                                     onChange={(event) => {
                                         dispatch(setTimeOfAction(true, event.target.value));
                                     }}
                        />
                        <Checkbox checked={additionalExpr.checked} onClick={() => dispatch(toggleAdditionalExpr())}>
                            <strong>Additional type of expression data</strong>
                        </Checkbox>
                        <FormControl type="text" placeholder="E.g., qPCR, Proteomics"
                                     onClick={() => dispatch(setAdditionalExpr(true, additionalExpr.details))}
                                     value={additionalExpr.details}
                                     onChange={(event) => {
                                         dispatch(setAdditionalExpr(true, event.target.value));
                                     }}
                        />
                        </Form>
                    </div>
                </Panel.Body>
            </Panel>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Large-scale gene expression data</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <p>
                        WormBase regularly imports microarray and RNA-seq data from Gene Expression Omnibus. If you haven’t already, please submit your data to <a href="https://www.ncbi.nlm.nih.gov/geo/info/submission.html"
                                              target={"_blank"}>GEO <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/></a>
                    </p>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    let payload = {
                        anatomic_expr: getCheckboxDBVal(expression.checked, expression.details),
                        site_action: getCheckboxDBVal(siteOfAction.checked, siteOfAction.details),
                        time_action: getCheckboxDBVal(timeOfAction.checked, timeOfAction.details),
                        additional_expr: getCheckboxDBVal(additionalExpr.checked, additionalExpr.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.EXPRESSION));
                }}>Save and go to next section
                </Button>
            </div>
        </div>
    );
}

export default Expression;