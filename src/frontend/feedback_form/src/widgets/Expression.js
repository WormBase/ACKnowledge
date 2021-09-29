import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {
    getAdditionalExpr,
    getExpression,
    getRnaseq,
    getSiteOfAction,
    getTimeOfAction, isExpressionSavedToDB
} from "../redux/selectors/expressionSelectors";
import {connect} from "react-redux";
import {
    setAdditionalExpr,
    setExpression, setIsExpressionSavedToDB, setRnaseq,
    setSiteOfAction,
    setTimeOfAction,
    toggleExpression, toggleRnaseq,
    toggleSiteOfAction, toggleTimeOfAction
} from "../redux/actions/expressionActions";
import {showDataSaved} from "../redux/actions/displayActions";
import {getCheckboxDBVal} from "../AFPValues";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Expression = (props) =>{

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
                saved={props.isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Expression data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <Checkbox checked={props.expression.checked} onClick={() => props.toggleExpression()}>
                            <strong>Anatomic Expression data in WT condition</strong> <OverlayTrigger placement="top"
                                                                                                      overlay={tooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top"
                                                                                                overlay={svmTooltip}>
                            <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                        </Checkbox>
                        <FormControl type="text" placeholder="Add details here"
                                     onClick={() => props.setExpression(true, props.expression.details)}
                                     value={props.expression.details}
                                     onChange={(event) => {
                                         props.setExpression(true, event.target.value);
                                     }}
                        />
                        <Checkbox checked={props.siteOfAction.checked} onClick={() => props.toggleSiteOfAction()}>
                            <strong>Site of action data</strong> <OverlayTrigger placement="top"
                                                                                 overlay={siteTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger>
                        </Checkbox>
                        <FormControl type="text" placeholder="Add details here"
                                     onClick={() => props.setSiteOfAction(true, props.siteOfAction.details)}
                                     value={props.siteOfAction.details}
                                     onChange={(event) => {
                                         props.setSiteOfAction(true, event.target.value);
                                     }}
                        />
                        <Checkbox checked={props.timeOfAction.checked} onClick={() => props.toggleTimeOfAction()}>
                            <strong>Time of action data</strong> <OverlayTrigger placement="top"
                                                                                 overlay={timeTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger>
                        </Checkbox>
                        <FormControl type="text" placeholder="Add details here"
                                     onClick={() => props.setTimeOfAction(true, props.timeOfAction.details)}
                                     value={props.timeOfAction.details}
                                     onChange={(event) => {
                                         props.setTimeOfAction(true, event.target.value);
                                     }}
                        />
                        <Checkbox checked={props.rnaSeq.checked} onClick={() => props.toggleRnaseq()}>
                            <strong>RNAseq data</strong>
                        </Checkbox>
                        <FormControl type="text" placeholder="Add details here"
                                     onClick={() => props.setRnaseq(true, props.rnaSeq.details)}
                                     value={props.rnaSeq.details}
                                     onChange={(event) => {
                                         props.setRnaseq(true, event.target.value);
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
                                value={props.additionalExpr}
                                placeholder="Add details here (e.g., qPCR, Proteomics)"
                                onChange={(event) => {
                                    props.setAdditionalExpr(event.target.value);
                                }}
                            />
                        </Col>
                    </Form>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    let payload = {
                        anatomic_expr: getCheckboxDBVal(props.expression.checked, props.expression.details),
                        site_action: getCheckboxDBVal(props.siteOfAction.checked, props.siteOfAction.details),
                        time_action: getCheckboxDBVal(props.timeOfAction.checked, props.timeOfAction.details),
                        rnaseq: getCheckboxDBVal(props.rnaSeq.checked, props.rnaSeq.details),
                        additional_expr: props.additionalExpr,
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.EXPRESSION);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    expression: getExpression(state),
    siteOfAction: getSiteOfAction(state),
    timeOfAction: getTimeOfAction(state),
    rnaSeq: getRnaseq(state),
    additionalExpr: getAdditionalExpr(state),
    isSavedToDB: isExpressionSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {setExpression, toggleExpression, setSiteOfAction, toggleSiteOfAction,
    setTimeOfAction, toggleTimeOfAction, setRnaseq, toggleRnaseq, setAdditionalExpr, showDataSaved,
    setIsExpressionSavedToDB, saveWidgetData})(Expression);