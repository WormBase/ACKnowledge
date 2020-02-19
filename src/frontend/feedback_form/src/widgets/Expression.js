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
    setExpression, setRnaseq,
    setSiteOfAction,
    setTimeOfAction,
    toggleExpression, toggleRnaseq,
    toggleSiteOfAction, toggleTimeOfAction
} from "../redux/actions/expressionActions";

class Expression extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            active: false,
        };
    }

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

    setSuccessAlertMessage() {
        this.alertDismissable.setSaved(true);
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
                function or other similar experiments. We encourage authors to refer to
                a specific piece of text from their publication in the text box provided.
            </Tooltip>
        );

        const timeTooltip = (
            <Tooltip id="tooltip">
                At what time is a specific gene to carry out its
                function? This can be demonstrated by phenotype rescue using a
                lifestage-specific exogenous promoter, a temperature-shift experiment
                with a temperature-sensitive allele or other similar experiments. We
                encourage authors to refer to a specific piece of text from their
                publication in the text box provided.
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
                    ref={instance => { this.alertDismissable = instance; }}
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
                                         onClick={() => this.props.setExpression(true, '')}
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
                                         onClick={() => this.props.setSiteOfAction(true, '')}
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
                                         onClick={() => this.props.setTimeOfAction(true, '')}
                                         value={this.props.timeOfAction.details}
                                         onChange={(event) => {
                                             this.setTimeOfAction(true, event.target.value);
                                         }}
                            />
                            <Checkbox checked={this.props.rnaSeq.checked} onClick={() => this.props.toggleRnaseq()}>
                                <strong>RNAseq data</strong>
                            </Checkbox>
                            <FormControl type="text" placeholder="Add details here"
                                         onClick={() => this.props.setRnaseq(true, '')}
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
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "expression")}>Save and continue
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
    isSavedToDB: isExpressionSavedToDB(state)
});

export default connect(mapStateToProps, {setExpression, toggleExpression, setSiteOfAction, toggleSiteOfAction,
    setTimeOfAction, toggleTimeOfAction, setRnaseq, toggleRnaseq, setAdditionalExpr})(Expression);