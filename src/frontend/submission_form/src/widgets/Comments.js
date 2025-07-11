import React from 'react';
import {Button, FormControl, Glyphicon, Image, Panel} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {useDispatch, useSelector} from "react-redux";
import {setComments} from "../redux/actions/commentsActions";
import {showSectionsNotCompleted} from "../redux/actions/displayActions";
import {WIDGET} from "../constants";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Other = () => {
    const dispatch = useDispatch();

    const overviewSaved = useSelector((state) => state.overview.isSavedToDB);
    const geneticsSaved = useSelector((state) => state.genetics.isSavedToDB);
    const reagentSaved = useSelector((state) => state.reagent.isSavedToDB);
    const expressionSaved = useSelector((state) => state.expression.isSavedToDB);
    const interactionsSaved = useSelector((state) => state.interactions.isSavedToDB);
    const phenotypesSaved = useSelector((state) => state.phenotypes.isSavedToDB);
    const diseaseSaved = useSelector((state) => state.disease.isSavedToDB);

    const isSavedToDB = useSelector((state) => state.comments.isSavedToDB);
    const allOtherWidgetsSavedToDB =  overviewSaved && geneticsSaved && reagentSaved && expressionSaved &&
        interactionsSaved && phenotypesSaved && diseaseSaved

    const comments = useSelector((state) => state.comments.comments);
    const person = useSelector((state) => state.person.person);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="In this page you can update your contact info, submit your unpublished data to
                    microPublication, send comments to the WormBase team and finalize the data submission process."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
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
                                    Please check that your contact info is up to date by clicking on the link below
                                </div>
                            </div>
                            <br/>
                            <div className="row">
                                <div className="col-sm-5">
                                    <a 
                                        href={"https://wormbase.org/submissions/person.cgi?action=Display&number=WBPerson" + person.personId}
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
                                    >
                                        <Glyphicon glyph="new-window" style={{fontSize: '10px', marginRight: '4px'}}/>
                                        Update contact info
                                    </a>
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
                                    Please check that your lineage is up to date by clicking on the link below
                                </div>
                            </div>
                            <br/>
                            <div className="row">
                                <div className="col-sm-5">
                                    <a 
                                        href={"https://wormbase.org/submissions/person_lineage.cgi?action=Display&number=WBPerson" + person.personId}
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
                                    >
                                        <Glyphicon glyph="new-window" style={{fontSize: '10px', marginRight: '4px'}}/>
                                        Update lineage
                                    </a>
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
                            Please give us your feedback
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    Please let us know about your experience with this submission. What did you like?
                                    What can we do to make the process easier? Did we miss anything?
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl componentClass="textarea" multiple
                                                 placeholder="Write comments here"
                                                 value={comments}
                                                 onChange={(event) => {dispatch(setComments(event.target.value))}}
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    if (allOtherWidgetsSavedToDB) {
                        const payload = {
                            comments: comments,
                            person_id: "two" + person.personId,
                            passwd: paperPassword
                        };
                        dispatch(saveWidgetData(payload, WIDGET.COMMENTS));
                    } else {
                        dispatch(showSectionsNotCompleted());
                    }
                }}>Finish and submit
                </Button>
            </div>
        </div>
    );
}

export default Other;