import React from 'react';
import {Button, FormControl, Image, Panel} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {connect} from "react-redux";
import {setComments, setIsCommentsSavedToDB} from "../redux/actions/commentsActions";
import {getComments, isCommentsSavedToDB} from "../redux/selectors/commentsSelectors";
import {showDataSaved, showSectionsNotCompleted} from "../redux/actions/displayActions";
import {isOverviewSavedToDB} from "../redux/selectors/overviewSelectors";
import {isGeneticsSavedToDB} from "../redux/selectors/geneticsSelectors";
import {isReagentSavedToDB} from "../redux/selectors/reagentSelectors";
import {isExpressionSavedToDB} from "../redux/selectors/expressionSelectors";
import {isInteractionsSavedToDB} from "../redux/selectors/interactionsSelectors";
import {isPhenotypesSavedToDB} from "../redux/selectors/phenotypesSelectors";
import {isDiseaseSavedToDB} from "../redux/selectors/diseaseSelectors";
import {getPerson} from "../redux/selectors/personSelectors";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {WIDGET} from "../constants";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Other = (props) => {

    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="In this page you can update your contact info, submit your unpublished data to
                    microPublication, send comments to the WormBase team and finalize the data submission process."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={props.isSavedToDB}
            />
            <form>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Update contact info
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    Please check that your contact info is up to date by clicking on the button below
                                </div>
                            </div>
                            <br/>
                            <div className="row">
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                            href={"https://wormbase.org/submissions/person.cgi?action=Display&number=WBPerson" + props.personId}
                                            target={"_blank"}>
                                        Update contact info</Button>
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Update lineage
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    Please check that your lineage is up to date by clicking on the button below
                                </div>
                            </div>
                            <br/>
                            <div className="row">
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                            href={"https://wormbase.org/submissions/person_lineage.cgi?action=Display&number=WBPerson" + props.personId}
                                            target={"_blank"}>
                                        Update lineage</Button>
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Do you have additional unpublished data?
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="row">
                            <div className="col-sm-10">
                                If you have unpublished data generated during this study, we encourage you to
                                submit it at <a href="https://www.micropublication.org" target="_blank">
                                micropublication.org</a>
                            </div>
                            <div className="col-sm-2">
                                <a href="https://www.micropublication.org" target="_blank">
                                    <Image src="micropub_logo.png" responsive/>
                                </a>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Have we missed anything? Do you have any comments?
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    Write comments here
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl componentClass="textarea" multiple
                                                 value={props.comments}
                                                 onChange={(event) => {props.setComments(event.target.value)}}
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    if (props.allOtherWidgetsSavedToDB) {
                        const payload = {
                            comments: props.comments,
                            person_id: "two" + props.person.personId,
                            passwd: props.paperPasswd
                        };
                        props.saveWidgetData(payload, WIDGET.COMMENTS);
                    } else {
                        props.showSectionsNotCompleted();
                    }
                }}>Finish and submit
                </Button>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    comments: getComments(state),
    isSavedToDB: isCommentsSavedToDB(state),
    person: getPerson(state),
    allOtherWidgetsSavedToDB: isOverviewSavedToDB(state) && isGeneticsSavedToDB(state) && isReagentSavedToDB(state) &&
        isExpressionSavedToDB(state) && isInteractionsSavedToDB(state) && isPhenotypesSavedToDB(state) &&
        isDiseaseSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {setComments, showDataSaved, showSectionsNotCompleted, setIsCommentsSavedToDB, saveWidgetData})(Other);