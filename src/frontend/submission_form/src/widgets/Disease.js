import React, { useState } from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Alert, Checkbox, Form, FormControl, Glyphicon, Panel
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import MultiSelect from "../components/multiselect/MultiSelect";
import DiseaseAutoComplete from "../components/multiselect/DiseaseAutoComplete";
import DiseaseRequiredModal from "../components/modals/DiseaseRequiredModal";
import {setDisease, toggleDisease, addDiseaseName, removeDiseaseName} from "../redux/actions/diseaseActions";
import {useDispatch, useSelector} from "react-redux";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";
import {WIDGET} from "../constants";

const Disease = () => {
    const dispatch = useDispatch();
    const [showDiseaseRequiredModal, setShowDiseaseRequiredModal] = useState(false);
    const disease = useSelector((state) => state.disease.disease);
    const diseaseNames = useSelector((state) => state.disease.diseaseNames);
    const addedDiseaseNames = useSelector((state) => state.disease.addedDiseaseNames);
    const savedDiseaseNames = useSelector((state) => state.disease.savedDiseaseNames);
    const isSavedToDB = useSelector((state) => state.disease.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);
    const person = useSelector((state) => state.person.person);

    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="If this paper reports a disease model, please choose one or more that it describes."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <div style={{marginBottom: '15px', textAlign: 'right'}}>
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    const payload = {
                        disease: getCheckboxDBVal(disease.checked, disease.details),
                        disease_list: diseaseNames,
                        person_id: "two" + person.personId,
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetDataSilently(payload, WIDGET.DISEASE));
                }}>
                    <Glyphicon glyph="cloud-upload" style={{marginRight: '6px'}} />
                    Save current progress
                </Button>
            </div>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Disease model data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <Checkbox checked={disease.checked} onClick={() => dispatch(toggleDisease())}>
                            <strong>The paper describes an experimental model for a specific human disease (e.g., Parkinson’s disease) by employing at least one of the following:</strong>
                        </Checkbox>
                        <ul>
                            <li><strong>Gene/allele or strain that recapitulates disease phenotype(s) and provides insight into disease pathogenesis. Please provide official names for strains (e.g., CL2006).</strong></li>
                            <li><strong>Transgenic studies with human and/or worm disease relevant gene.</strong></li>
                            <li><strong>Modifiers of a new or previously established disease model (e.g., drugs, herbals, chemicals, etc).</strong></li>
                        </ul>
                    </Form>
                </Panel.Body>
            </Panel>
            
            {disease.checked && (
                <>
                    <Alert bsStyle="warning" style={{marginTop: '20px', marginBottom: '20px'}}>
                        <strong>Important:</strong> Since you indicated this paper describes a human disease model, 
                        please specify which disease(s) are studied in your paper. This information is required.
                    </Alert>
                    
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Specific diseases studied in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultiSelect
                                items={diseaseNames}
                                addedItems={addedDiseaseNames}
                                savedItems={savedDiseaseNames}
                                itemsNameSingular="disease"
                                itemsNamePlural="diseases"
                                addItemFunction={(disease) => dispatch(addDiseaseName(disease))}
                                remItemFunction={(disease) => dispatch(removeDiseaseName(disease))}
                                searchType="disease"
                                sampleQuery="e.g. Parkinson's"
                                defaultExactMatchOnly={false}
                                exactMatchTooltip="Check this to search for exact disease names only"
                                autocompletePlaceholder="Type disease names to search. For example:
Parkinson's disease
Alzheimer's disease
Cancer
Diabetes"
                                customAutoComplete={(props) => <DiseaseAutoComplete {...props} />}
                                customTitle="Specify diseases studied in the paper"
                                showTpcBadge={false}
                                emptyStateText="No diseases selected"
                            />
                        </Panel.Body>
                    </Panel>
                </>
            )}
            
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        Additional comments on disease models in the paper
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
                                             value={disease.details}
                                             onClick={() => dispatch(setDisease(true, disease.details))}
                                             onChange={(event) => {
                                                 dispatch(setDisease(true, event.target.value));
                                             }}
                                />
                            </div>
                        </div>
                    </div>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    // Validate that if disease is checked, at least one disease name is selected
                    if (disease.checked && diseaseNames.length === 0) {
                        setShowDiseaseRequiredModal(true);
                        return;
                    }
                    
                    const payload = {
                        disease: getCheckboxDBVal(disease.checked, disease.details),
                        disease_list: diseaseNames,
                        person_id: "two" + person.personId,
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.DISEASE));
                }}>Save and go to next section
                </Button>
            </div>
            
            <DiseaseRequiredModal 
                show={showDiseaseRequiredModal} 
                close={() => setShowDiseaseRequiredModal(false)}
            />
        </div>
    );
}

export default Disease;