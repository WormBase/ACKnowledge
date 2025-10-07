import React, { useState } from 'react';
import {
    Alert,
    Button,
    Checkbox,
    Collapse,
    Form,
    FormControl,
    FormGroup,
    Glyphicon,
    OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultiSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../components/InstructionsAlert";
import {useDispatch, useSelector} from "react-redux";
import {
    addTransgene,
    removeTransgene,
    setNewAntibodies, setOtherAntibodies, setOtherTransgenes,
    toggleNewAntibodies
} from "../redux/actions/reagentActions";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import {WIDGET} from "../constants";
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";
import axios from "axios";

const Reagent = () => {
    const dispatch = useDispatch();
    const [showOtherTransgenes, setShowOtherTransgenes] = useState(false);
    const transgenes = useSelector((state) => state.reagent.transgenes.elements);
    const addedTransgenes = useSelector((state) => state.reagent.addedTransgenes);
    const savedTransgenes = useSelector((state) => state.reagent.savedTransgenes);
    const tfpTransgenes = useSelector((state) => state.reagent.tfpTransgenes);
    const newAntibodies = useSelector((state) => state.reagent.newAntibodies);
    const otherTransgenes = useSelector((state) => state.reagent.otherTransgenes.elements);
    const otherAntibodies = useSelector((state) => state.reagent.otherAntibodies.elements);
    const isSavedToDB = useSelector((state) => state.reagent.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);
    const personId = useSelector((state) => state.person.personId);
    const person = useSelector((state) => state.person.person);

    // State for transgenes spreadsheet creation
    const [creatingTransgenesSpreadsheet, setCreatingTransgenesSpreadsheet] = useState(false);
    const [transgenesSpreadsheetError, setTransgenesSpreadsheetError] = useState(null);

    const handleCreateTransgenesSpreadsheet = async () => {
        setCreatingTransgenesSpreadsheet(true);
        setTransgenesSpreadsheetError(null);

        try {
            // Use the same base URL as other API calls
            const writeEndpoint = process.env.REACT_APP_API_DB_WRITE_ENDPOINT || 'http://localhost:8001/api/write';
            const apiBaseUrl = writeEndpoint.replace('/api/write', '');
            const response = await axios.post(`${apiBaseUrl}/api/create_transgenes_spreadsheet`, {
                passwd: paperPassword,
                person_id: personId,
                person_name: person.name || 'Unknown Author'
            });

            if (response.data.success) {
                // Open spreadsheet in new tab
                window.open(response.data.spreadsheet_url, '_blank');
            } else {
                setTransgenesSpreadsheetError('Failed to create spreadsheet');
            }
        } catch (error) {
            console.error('Error creating transgenes spreadsheet:', error);
            setTransgenesSpreadsheetError('Failed to create spreadsheet. Please try again.');
        } finally {
            setCreatingTransgenesSpreadsheet(false);
        }
    };

    const transgenesTooltip = (
        <Tooltip id="tooltip">
            Please validate the list of transgenes experimentally studied in your paper in the box below by adding or removing transgenes if required.
        </Tooltip>
    );
    const antibodyTooltip = (
        <Tooltip id="tooltip">
            Click on Newly generated antibody and provide details if you generated an antibody in your lab. If you
            used an antibody generated in another study, add the Antibody name and PubMed ID of the original
            publication in the ‘Other Antibodies’ table.
        </Tooltip>
    );

    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="Here you can find transgenes that have been experimentally studied in your paper. Please
                    validate the list as for the previous section. You can also submit information about antibodies
                    mentioned or generated in the study."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <form>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">List of WormBase transgenes experimentally studied in the paper <OverlayTrigger placement="top" overlay={transgenesTooltip}>
                            <Glyphicon glyph="question-sign"/>
                        </OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <MultiSelect
                            linkWB={"https://wormbase.org/species/c_elegans/transgene"}
                            itemsNamePlural={"transgenes"}
                            items={transgenes}
                            addedItems={addedTransgenes}
                            savedItems={tfpTransgenes}  // Use tfp_ data as the reference for comparison
                            addItemFunction={(transgene) => dispatch(addTransgene(transgene))}
                            remItemFunction={(transgene) => dispatch(removeTransgene(transgene))}
                            searchType={"transgene"}
                            defaultExactMatchOnly={false}
                            exactMatchTooltip={"Check this to search for exact transgene names only"}
                            autocompletePlaceholder={"Type transgene names, one per line or separated by commas. For example:\nctIs40\nWBTransgene00000647"}
                        />

                        {/* Transgenes spreadsheet upload button */}
                        <div style={{marginTop: '15px', marginBottom: '15px'}}>
                            <Button
                                bsStyle="info"
                                bsSize="small"
                                onClick={handleCreateTransgenesSpreadsheet}
                                disabled={creatingTransgenesSpreadsheet}
                            >
                                <Glyphicon glyph="upload" style={{marginRight: '6px', fontSize: '14px'}} />
                                {creatingTransgenesSpreadsheet ? 'Creating...' : 'Upload Transgene spreadsheet (for large lists) - opens in new tab'}
                            </Button>
                            {transgenesSpreadsheetError && (
                                <Alert bsStyle="danger" style={{marginTop: '8px', padding: '6px', fontSize: '12px'}}>
                                    {transgenesSpreadsheetError}
                                </Alert>
                            )}
                        </div>

                        {/* New transgenes section integrated into main panel */}
                        <div style={{marginTop: '15px'}}>
                            <Button
                                onClick={() => setShowOtherTransgenes(!showOtherTransgenes)}
                                aria-controls="other-transgenes-collapse"
                                aria-expanded={showOtherTransgenes}
                                bsStyle="link"
                                style={{
                                    padding: '0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    color: '#337ab7'
                                }}
                            >
                                <Glyphicon glyph={showOtherTransgenes ? "chevron-down" : "chevron-right"} style={{marginRight: '6px'}} />
                                Can't find a transgene? Add new transgenes not yet in WormBase
                            </Button>
                            <Collapse in={showOtherTransgenes}>
                                <div id="other-transgenes-collapse" style={{marginTop: '10px'}}>
                                    <Alert bsStyle="info" style={{fontSize: '13px'}}>
                                        <strong>Note:</strong> If a transgene you're looking for doesn't appear when using the "Add" button above
                                        (because it's new and not yet in WormBase), you can enter it manually below.
                                        This is for newly generated transgenes that haven't been curated into WormBase yet.
                                    </Alert>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <ControlLabel>
                                                    Enter one transgene per line. If possible, enter the transgene name followed by genotype followed by species, separated by comma. <br/>
                                                    e.g. <i>eaIs15</i>, [<i>Ppie-1::HIM-5::GFP::pie-1</i>], <i>C. elegans</i> <br/>
                                                    e.g. <i>sqEx67</i>, [<i>rgef-1p::mcherry::GFP::lgg-1 + rol-6</i>], <i>C. elegans</i>
                                                </ControlLabel>
                                                <FormControl componentClass="textarea" rows="5" placeholder="Enter new transgenes not yet in WormBase here, one per line"
                                                             value={otherTransgenes.map(a => a.name).join("\n")}
                                                             onChange={e => dispatch(setOtherTransgenes(e.target.value.split("\n").map((a, index) => {
                                                                 return {id: index + 1, name: a}})))}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Antibodies in the paper <OverlayTrigger placement="top"
                                                                                                 overlay={antibodyTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <Form>
                                <FormGroup>
                                    <Checkbox checked={newAntibodies.checked} onClick={dispatch(toggleNewAntibodies)}>
                                        <strong>Newly generated antibodies</strong>
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Enter antibody name and details here"
                                                 onClick={() => dispatch(setNewAntibodies())}
                                                 value={newAntibodies.details}
                                                 onChange={(event) => {dispatch(setNewAntibodies(true, event.target.value))}}/>
                                    <br/>
                                    <ControlLabel>Other Antibodies Used</ControlLabel>
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert antibodies here (optionally followed by PMID: 'antibody_name || PMID'), one per line"
                                                 value={otherAntibodies.map(a => {
                                                     if (a.name) {
                                                         if (a.publicationId !== undefined) {
                                                             return a.name + " || " + a.publicationId
                                                         } else {
                                                             return a.name
                                                         }}}).join("\n")}
                                                 onChange={e => dispatch(setOtherAntibodies(e.target.value.split("\n").map((a, index) => {
                                                     return {id: index + 1, name: a.split(" || ")[0], publicationId: a.split(" || ")[1]}})))}/>
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Form>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    const payload = {
                        transgenes_list: transformEntitiesIntoAfpString(transgenes, ""),
                        new_transgenes: JSON.stringify(otherTransgenes),
                        new_antibody: getCheckboxDBVal(newAntibodies.checked, newAntibodies.details),
                        other_antibodies: JSON.stringify(otherAntibodies),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.REAGENT));
                }}>Save and go to next section
                </Button>
            </div>
        </div>
    );
}

export default Reagent;
