import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {useDispatch, useSelector} from "react-redux";
import {
    setAdditionalExpr,
    setExpression, setRnaseq,
    setSiteOfAction,
    setTimeOfAction,
    toggleExpression, toggleRnaseq,
    toggleSiteOfAction, toggleTimeOfAction
} from "../redux/actions/expressionActions";
import {getCheckboxDBVal} from "../AFPValues";
import {WIDGET} from "../constants";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Expression = () =>{
    const dispatch = useDispatch();
    const expression = useSelector((state) => state.expression.expression);
    const siteOfAction = useSelector((state) => state.expression.siteOfAction);
    const timeOfAction = useSelector((state) => state.expression.timeOfAction);
    const rnaSeq = useSelector((state) => state.expression.rnaseq);
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
                    <Form>
                        <Checkbox checked={expression.checked} onClick={() => dispatch(toggleExpression())}>
                            <strong>Anatomic Expression data in WT condition</strong> <OverlayTrigger placement="top"
                                                                                                      overlay={tooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top"
                                                                                                overlay={svmTooltip}>
                            <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                        </Checkbox>
                        <FormControl type="text" placeholder="Add details here"
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
                        <FormControl type="text" placeholder="Add details here"
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
                        <FormControl type="text" placeholder="Add details here"
                                     onClick={() => dispatch(setTimeOfAction(true, timeOfAction.details))}
                                     value={timeOfAction.details}
                                     onChange={(event) => {
                                         dispatch(setTimeOfAction(true, event.target.value));
                                     }}
                        />
                        <Checkbox checked={rnaSeq.checked} onClick={() => dispatch(toggleRnaseq())}>
                            <strong>RNAseq data</strong>
                        </Checkbox>
                        <FormControl type="text" placeholder="Add details here"
                                     onClick={() => dispatch(setRnaseq(true, rnaSeq.details))}
                                     value={rnaSeq.details}
                                     onChange={(event) => {
                                         dispatch(setRnaseq(true, event.target.value));
                                     }}
                        />
                    </Form>
                </Panel.Body>
            </Panel>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Microarrays</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <p>
                        WormBase regularly imports microarray data from Gene Expression Omnibus. Please submit your
                        microarray data to <a href="https://www.ncbi.nlm.nih.gov/geo/info/submission.html"
                                              target={"_blank"}>GEO</a>
                    </p>
                </Panel.Body>
            </Panel>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Add additional type of expression data &nbsp;
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form horizontal>
                        <Col componentClass={ControlLabel} sm={7}>
                            <FormControl
                                type="text"
                                value={additionalExpr}
                                placeholder="Add details here (e.g., qPCR, Proteomics)"
                                onChange={(event) => {
                                    dispatch(setAdditionalExpr(event.target.value));
                                }}
                            />
                        </Col>
                    </Form>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    let payload = {
                        anatomic_expr: getCheckboxDBVal(expression.checked, expression.details),
                        site_action: getCheckboxDBVal(siteOfAction.checked, siteOfAction.details),
                        time_action: getCheckboxDBVal(timeOfAction.checked, timeOfAction.details),
                        rnaseq: getCheckboxDBVal(rnaSeq.checked, rnaSeq.details),
                        additional_expr: additionalExpr,
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.EXPRESSION));
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

export default Expression;