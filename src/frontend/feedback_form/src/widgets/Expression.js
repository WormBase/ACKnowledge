import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";
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

class Expression extends React.Component {

    getValidationState() {
        if (this.state.active === true) {
            const length = this.state.value.length;
            if (length > 0) {
                return 'success';
            } else {
                return 'error';
            }
        } else {
            return '';
        }
    }

    render() {
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
                    saved={this.props.isSavedToDB}
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Expression data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <Checkbox checked={this.props.expression.checked} onClick={() => this.props.toggleExpression()}>
                                <strong>Anatomic Expression data in WT condition</strong> <OverlayTrigger placement="top"
                                                                                         overlay={tooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger> <OverlayTrigger placement="top"
                                                                                                    overlay={svmTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => this.props.setExpression(true, this.props.expression.details)}
                                         value={this.props.expression.details}
                                         onChange={(event) => {
                                             this.props.setExpression(true, event.target.value);
                                         }}
                            />
                            <Checkbox checked={this.props.siteOfAction.checked} onClick={() => this.props.toggleSiteOfAction()}>
                                <strong>Site of action data</strong> <OverlayTrigger placement="top"
                                                                                     overlay={siteTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => this.props.setSiteOfAction(true, this.props.siteOfAction.details)}
                                         value={this.props.siteOfAction.details}
                                         onChange={(event) => {
                                             this.props.setSiteOfAction(true, event.target.value);
                                         }}
                            />
                            <Checkbox checked={this.props.timeOfAction.checked} onClick={() => this.props.toggleTimeOfAction()}>
                                <strong>Time of action data</strong> <OverlayTrigger placement="top"
                                                                                     overlay={timeTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => this.props.setTimeOfAction(true, this.props.timeOfAction.details)}
                                         value={this.props.timeOfAction.details}
                                         onChange={(event) => {
                                             this.props.setTimeOfAction(true, event.target.value);
                                         }}
                            />
                            <Checkbox checked={this.props.rnaSeq.checked} onClick={() => this.props.toggleRnaseq()}>
                                <strong>RNAseq data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => this.props.setRnaseq(true, this.props.rnaSeq.details)}
                                         value={this.props.rnaSeq.details}
                                         onChange={(event) => {
                                             this.props.setRnaseq(true, event.target.value);
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
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}>
                                <Col componentClass={ControlLabel} sm={7}>
                                    <FormControl
                                        type="text"
                                        value={this.props.additionalExpr}
                                        placeholder="Add details here (e.g., qPCR, Proteomics)"
                                        onChange={(event) => {
                                            this.props.setAdditionalExpr(event.target.value);
                                        }}
                                    />
                                    <FormControl.Feedback />
                                </Col>
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={() => {
                        let payload = {
                            anatomic_expr: getCheckboxDBVal(this.props.expression.checked, this.props.expression.details),
                            site_action: getCheckboxDBVal(this.props.siteOfAction.checked, this.props.siteOfAction.details),
                            time_action: getCheckboxDBVal(this.props.timeOfAction.checked, this.props.timeOfAction.details),
                            rnaseq: getCheckboxDBVal(this.props.rnaSeq.checked, this.props.rnaSeq.details),
                            additional_expr: this.props.additionalExpr,
                            passwd: this.props.paperPasswd
                        };
                        this.props.saveWidgetData(payload, WIDGET.EXPRESSION);
                    }}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
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