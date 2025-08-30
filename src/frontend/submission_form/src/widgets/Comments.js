import React from 'react';
import {Button, FormControl, Glyphicon, Image, OverlayTrigger, Panel, Tooltip} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {useDispatch, useSelector} from "react-redux";
import {setComments} from "../redux/actions/commentsActions";
import {showSectionsNotCompleted} from "../redux/actions/displayActions";
import {WIDGET} from "../constants";
import {saveWidgetData} from "../redux/actions/widgetActions";

// CSS animation for the pulsing finish button
const pulseAnimation = `
    @keyframes pulse-glow {
        0% {
            box-shadow: 0 0 5px rgba(92, 184, 92, 0.7), 0 0 10px rgba(92, 184, 92, 0.4);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 20px rgba(92, 184, 92, 0.9), 0 0 30px rgba(92, 184, 92, 0.6), 0 0 40px rgba(92, 184, 92, 0.3);
            transform: scale(1.02);
        }
        100% {
            box-shadow: 0 0 5px rgba(92, 184, 92, 0.7), 0 0 10px rgba(92, 184, 92, 0.4);
            transform: scale(1);
        }
    }
`;

const Other = () => {
    const dispatch = useDispatch();

    const lineageTooltip = (
        <Tooltip id="lineage-tooltip">
            Describe your professional associations - those who trained you and those you have trained/collaborated with.
        </Tooltip>
    );

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
    
    // Check if submission is finalized (all sections including Comments are saved)
    const isSubmissionFinalized = allOtherWidgetsSavedToDB && isSavedToDB

    const comments = useSelector((state) => state.comments.comments);
    const savedComments = useSelector((state) => state.comments.savedComments);
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
            
            {/* Show a clear message when submission is finalized */}
            {isSubmissionFinalized && (
                <div className="alert alert-info" style={{
                    backgroundColor: '#e3f2fd',
                    borderColor: '#2196f3',
                    color: '#0d47a1',
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    <strong>✓ Your submission has been successfully finalized!</strong>
                    <br/><br/>
                    <strong>To make additional changes:</strong>
                    <ol style={{marginBottom: '5px', paddingLeft: '20px'}}>
                        <li>Navigate to any section and make your changes</li>
                        <li>Click "Save and go to next section" to save data in each individual section or
                            "Save current progress" to save all modified sections</li>
                        <li>Return to this Comments section</li>
                        <li>Click "Re-submit to WormBase" to finalize your new changes</li>
                    </ol>
                    <small style={{fontStyle: 'italic'}}>Note: Changes are not sent to WormBase until you click the re-submit button.</small>
                </div>
            )}
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
                                        Update contact info <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
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
                                    <OverlayTrigger placement="top" overlay={lineageTooltip}>
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
                                            Update lineage <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                                        </a>
                                    </OverlayTrigger>
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
                                micropublication.org <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/></a>
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
            <div align="right" style={{position: 'relative'}}>
                {/* Add the animation styles only if not finalized */}
                {!isSubmissionFinalized && <style>{pulseAnimation}</style>}
                
                {/* Show a badge when ready to submit but not yet finalized */}
                {allOtherWidgetsSavedToDB && !isSubmissionFinalized && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#d9534f',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 1,
                        animation: 'pulse-glow 2s infinite'
                    }}>!</div>
                )}
                
                <OverlayTrigger 
                    placement="left" 
                    overlay={
                        <Tooltip id="submit-tooltip">
                            {isSubmissionFinalized 
                                ? (comments !== savedComments 
                                    ? <strong>You have unsaved comments. Click here to re-submit your changes to WormBase.</strong>
                                    : "Your submission has been finalized. To make further changes: 1) Edit any section, 2) Save those changes using 'Save current progress', 3) Return here and click this button to re-submit.")
                                : allOtherWidgetsSavedToDB 
                                    ? <strong>All sections are complete! Click here to finalize and submit your data to WormBase.</strong>
                                    : "Please complete and save all other sections before submitting."
                            }
                        </Tooltip>
                    }
                >
                    <Button 
                        bsStyle={isSubmissionFinalized ? "primary" : allOtherWidgetsSavedToDB ? "success" : "primary"} 
                        bsSize={isSubmissionFinalized ? "small" : allOtherWidgetsSavedToDB ? "large" : "small"}
                        onClick={() => {
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
                        }}
                        disabled={isSubmissionFinalized && comments === savedComments}
                        style={{
                            ...(allOtherWidgetsSavedToDB && !isSubmissionFinalized ? {
                                animation: 'pulse-glow 2s infinite',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                padding: '10px 15px',
                                border: '2px solid #4cae4c',
                                position: 'relative',
                                overflow: 'visible'
                            } : {})
                        }}
                    >
                        <Glyphicon glyph={isSubmissionFinalized ? "save" : allOtherWidgetsSavedToDB ? "send" : "save"} style={{marginRight: '6px'}} />
                        {isSubmissionFinalized 
                            ? (comments !== savedComments ? "Re-submit changes" : "Re-submit to WormBase")
                            : allOtherWidgetsSavedToDB ? "FINISH AND SUBMIT" : "Finish and submit"}
                    </Button>
                </OverlayTrigger>
            </div>
        </div>
    );
}

export default Other;