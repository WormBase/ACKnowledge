import React, { useState } from 'react';
import {
    Alert,
    Button, Checkbox, Collapse, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultiSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../components/InstructionsAlert";
import AutoDetectedBadge from "../components/AutoDetectedBadge";
import {useDispatch, useSelector} from "react-redux";
import {
    addAllele,
    addStrain,
    removeAllele,
    removeStrain, setOtherAlleles, setOtherStrains,
    setSequenceChange, setStrainAlreadyPresentError,
    toggleSequenceChange
} from "../redux/actions/geneticsActions";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import FormControl from "react-bootstrap/lib/FormControl";
import {WIDGET} from "../constants";
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Modal from "react-bootstrap/lib/Modal";
import PropTypes from "prop-types";
import axios from "axios";
import SaveButton from "../components/SaveButton";

const Genetics = ({hideAlleles, hideStrains, toggleEntityVisibilityCallback}) => {
    const dispatch = useDispatch();
    const alleles = useSelector((state) => state.genetics.alleles.elements);
    const addedAlleles = useSelector((state) => state.genetics.addedAlleles);
    const savedAlleles = useSelector((state) => state.genetics.savedAlleles);
    const tfpAlleles = useSelector((state) => state.genetics.tfpAlleles);
    const otherAlleles = useSelector((state) => state.genetics.otherAlleles.elements);
    const strains = useSelector((state) => state.genetics.strains.elements);
    const addedStrains = useSelector((state) => state.genetics.addedStrains);
    const savedStrains = useSelector((state) => state.genetics.savedStrains);
    const tfpStrains = useSelector((state) => state.genetics.tfpStrains);
    const otherStrains = useSelector((state) => state.genetics.otherStrains.elements);
    const sequenceChange = useSelector((state) => state.genetics.sequenceChange);
    const strainAlreadyPresentError = useSelector((state) => state.genetics.strainAlreadyPresentError);
    const isSavedToDB = useSelector((state) => state.genetics.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);
    const personId = useSelector((state) => state.person.personId);
    const person = useSelector((state) => state.person.person);
    
    // State for alleles spreadsheet creation
    const [creatingAllelesSpreadsheet, setCreatingAllelesSpreadsheet] = useState(false);
    const [allelesSpreadsheetError, setAllelesSpreadsheetError] = useState(null);
    
    // State for strains spreadsheet creation
    const [creatingStrainsSpreadsheet, setCreatingStrainsSpreadsheet] = useState(false);
    const [strainsSpreadsheetError, setStrainsSpreadsheetError] = useState(null);

    // State for collapsible sections
    const [showOtherAlleles, setShowOtherAlleles] = useState(false);
    const [showOtherStrains, setShowOtherStrains] = useState(false);

    const handleCreateAllelesSpreadsheet = async () => {
        setCreatingAllelesSpreadsheet(true);
        setAllelesSpreadsheetError(null);
        
        try {
            // Use the same base URL as other API calls
            const writeEndpoint = process.env.REACT_APP_API_DB_WRITE_ENDPOINT || 'http://localhost:8001/api/write';
            const apiBaseUrl = writeEndpoint.replace('/api/write', '');
            const response = await axios.post(`${apiBaseUrl}/api/create_alleles_spreadsheet`, {
                passwd: paperPassword,
                person_id: personId,
                person_name: person.name || 'Unknown Author'
            });
            
            if (response.data.success) {
                // Open spreadsheet in new tab
                window.open(response.data.spreadsheet_url, '_blank');
            } else {
                setAllelesSpreadsheetError('Failed to create spreadsheet');
            }
        } catch (error) {
            console.error('Error creating alleles spreadsheet:', error);
            setAllelesSpreadsheetError('Failed to create spreadsheet. Please try again.');
        } finally {
            setCreatingAllelesSpreadsheet(false);
        }
    };
    
    const handleCreateStrainsSpreadsheet = async () => {
        setCreatingStrainsSpreadsheet(true);
        setStrainsSpreadsheetError(null);
        
        try {
            // Use the same base URL as other API calls
            const writeEndpoint = process.env.REACT_APP_API_DB_WRITE_ENDPOINT || 'http://localhost:8001/api/write';
            const apiBaseUrl = writeEndpoint.replace('/api/write', '');
            const response = await axios.post(`${apiBaseUrl}/api/create_strains_spreadsheet`, {
                passwd: paperPassword,
                person_id: personId,
                person_name: person.name || 'Unknown Author'
            });
            
            if (response.data.success) {
                // Open spreadsheet in new tab
                window.open(response.data.spreadsheet_url, '_blank');
            } else {
                setStrainsSpreadsheetError('Failed to create spreadsheet');
            }
        } catch (error) {
            console.error('Error creating strains spreadsheet:', error);
            setStrainsSpreadsheetError('Failed to create spreadsheet. Please try again.');
        } finally {
            setCreatingStrainsSpreadsheet(false);
        }
    };

    const allelesTooltip = (
        <Tooltip id="tooltip">
            Please validate the list of alleles experimentally studied in your paper in the box below by adding or removing alleles if required. Note that not all the Million Mutation Project alleles are recognized
        </Tooltip>
    );

    const strainsTooltip = (
        <Tooltip id="tooltip">
            Please validate the list of strains experimentally studied in your paper in the box below by adding or removing strains if required.
        </Tooltip>
    );
    let allelesListComponent;
    if (hideAlleles) {
        allelesListComponent = (<Alert bsStyle="warning">More than 100 alleles were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of alleles click <a onClick={() => {
            toggleEntityVisibilityCallback("hide_alleles")
        }}>here</a>. If you prefer not to, all the alleles extracted will be associated to this paper in WormBase</Alert>);
    } else {
        allelesListComponent = (
            <MultiSelect
                linkWB={"https://wormbase.org/species/c_elegans/variation"}
                itemsNamePlural={"alleles"}
                items={alleles}
                addedItems={addedAlleles}
                savedItems={tfpAlleles}  // Use tfp_ data as the reference for comparison
                addItemFunction={(allele) => dispatch(addAllele(allele))}
                remItemFunction={(allele) => dispatch(removeAllele(allele))}
                searchType={"variation"}
                defaultExactMatchOnly={true}
                exactMatchTooltip={"Check this to search for exact allele names only"}
                autocompletePlaceholder={"Type allele names, one per line or separated by commas. For example:\ne1000\nWBVar00143672"}
            />);
    }
    let strainsListComponent;
    if (hideStrains) {
        strainsListComponent = (<Alert bsStyle="warning">More than 100 strains were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of strains click <a onClick={() => {
            toggleEntityVisibilityCallback("hide_strains")
        }}>here</a>. If you prefer not to, all the strains extracted will be associated to this paper in WormBase</Alert>);
    } else {
        strainsListComponent = (
            <MultiSelect
                linkWB={"https://wormbase.org/species/c_elegans/strain"}
                itemsNamePlural={"strains"}
                items={strains}
                addedItems={addedStrains}
                savedItems={tfpStrains}  // Use tfp_ data as the reference for comparison
                addItemFunction={(strain) => dispatch(addStrain(strain))}
                remItemFunction={(strain) => dispatch(removeStrain(strain))}
                searchType={"strain"}
                defaultExactMatchOnly={false}
                exactMatchTooltip={"Check this to search for exact strain names only"}
                autocompletePlaceholder={"Type strain names, one per line or separated by commas. For example:\nCB4856\nWBStrain00004222"}
            />);
    }
    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="Here you can find alleles and strains that have been experimentally studied in your paper.
                    Please validate the list as for the previous section. You can also submit a new allele name and indicate an allele sequence change."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <form>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span>List of WormBase alleles experimentally studied in the paper</span>
                                <OverlayTrigger placement="top" overlay={allelesTooltip}>
                                    <Glyphicon glyph="question-sign"/>
                                </OverlayTrigger>
                            </div>
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        {allelesListComponent}

                        {/* Alleles spreadsheet upload button */}
                        {!hideAlleles && (
                            <div style={{marginTop: '15px', marginBottom: '15px'}}>
                                <Button
                                    bsStyle="info"
                                    bsSize="small"
                                    onClick={handleCreateAllelesSpreadsheet}
                                    disabled={creatingAllelesSpreadsheet}
                                >
                                    <Glyphicon glyph="upload" style={{marginRight: '6px', fontSize: '14px'}} />
                                    {creatingAllelesSpreadsheet ? 'Creating...' : 'Upload Allele spreadsheet (for large lists) - opens in new tab'}
                                </Button>
                                {allelesSpreadsheetError && (
                                    <Alert bsStyle="danger" style={{marginTop: '8px', padding: '6px', fontSize: '12px'}}>
                                        {allelesSpreadsheetError}
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* New alleles section integrated into main panel */}
                        <div style={{marginTop: '15px'}}>
                            <Button
                                onClick={() => setShowOtherAlleles(!showOtherAlleles)}
                                aria-controls="other-alleles-collapse"
                                aria-expanded={showOtherAlleles}
                                bsStyle="link"
                                style={{
                                    padding: '0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    color: '#337ab7'
                                }}
                            >
                                <Glyphicon glyph={showOtherAlleles ? "chevron-down" : "chevron-right"} style={{marginRight: '6px'}} />
                                Can't find an allele? Add new alleles not yet in WormBase
                            </Button>
                            <Collapse in={showOtherAlleles}>
                                <div id="other-alleles-collapse" style={{marginTop: '10px'}}>
                                    <Alert bsStyle="info" style={{fontSize: '13px'}}>
                                        <strong>Note:</strong> If an allele you're looking for doesn't appear when using the "Add" button above
                                        (because it's new and not yet in WormBase), you can enter it manually below.
                                        This is for newly generated alleles that haven't been curated into WormBase yet.
                                    </Alert>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <ControlLabel>
                                                    Enter one allele per line. If possible, enter the gene and allele name followed by strain and species, separated by comma. <br/>
                                                    e.g. <i>flu-4(e1004)</i>, CB1004, <i>C.elegans</i> <br/>
                                                    For CRISPR alleles include the knock-in construct, followed by strain and species, separated by comma. <br/>
                                                    e.g. <i>hmg-3(bar24[hmg-3::3xHA])</i>, BAT1560, <i>C. elegans</i>
                                                </ControlLabel>
                                                <FormControl componentClass="textarea" rows="5" placeholder="Enter new alleles not yet in WormBase here, one per line"
                                                             value={otherAlleles.map(a => a.name).join("\n")}
                                                             onChange={e => dispatch(setOtherAlleles(e.target.value.split("\n").map((a, index) => {
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
                        <Panel.Title componentClass="h3">Allele sequence change <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">Please alert us to any newly sequenced alleles.</Tooltip>}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row" style={{display: 'flex', alignItems: 'center'}}>
                                <div className="col-sm-7">
                                    <Checkbox checked={sequenceChange.checked}
                                              onClick={() => {
                                                  dispatch(toggleSequenceChange());
                                              }}><strong>Allele sequence change</strong> <AutoDetectedBadge/></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <OverlayTrigger overlay={<Tooltip id="tooltip">Submit allele sequence changes</Tooltip>}>
                                        <a
                                            href="https://wormbase.org/submissions/allele_sequence.cgi"
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
                                            onClick={() => dispatch(setSequenceChange(true, ''))}
                                        >
                                            Submit sequence details <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
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
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span>List of WormBase strains experimentally studied in the paper</span>
                                <OverlayTrigger placement="top" overlay={strainsTooltip}>
                                    <Glyphicon glyph="question-sign"/>
                                </OverlayTrigger>
                            </div>
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        {strainsListComponent}

                        {/* Strains spreadsheet upload button */}
                        {!hideStrains && (
                            <div style={{marginTop: '15px', marginBottom: '15px'}}>
                                <Button
                                    bsStyle="info"
                                    bsSize="small"
                                    onClick={handleCreateStrainsSpreadsheet}
                                    disabled={creatingStrainsSpreadsheet}
                                >
                                    <Glyphicon glyph="upload" style={{marginRight: '6px', fontSize: '14px'}} />
                                    {creatingStrainsSpreadsheet ? 'Creating...' : 'Upload Strain spreadsheet (for large lists) - opens in new tab'}
                                </Button>
                                {strainsSpreadsheetError && (
                                    <Alert bsStyle="danger" style={{marginTop: '8px', padding: '6px', fontSize: '12px'}}>
                                        {strainsSpreadsheetError}
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* New strains section integrated into main panel */}
                        <div style={{marginTop: '15px'}}>
                            <Button
                                onClick={() => setShowOtherStrains(!showOtherStrains)}
                                aria-controls="other-strains-collapse"
                                aria-expanded={showOtherStrains}
                                bsStyle="link"
                                style={{
                                    padding: '0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    color: '#337ab7'
                                }}
                            >
                                <Glyphicon glyph={showOtherStrains ? "chevron-down" : "chevron-right"} style={{marginRight: '6px'}} />
                                Can't find a strain? Add new strains not yet in WormBase
                            </Button>
                            <Collapse in={showOtherStrains}>
                                <div id="other-strains-collapse" style={{marginTop: '10px'}}>
                                    <Alert bsStyle="info" style={{fontSize: '13px'}}>
                                        <strong>Note:</strong> If a strain you're looking for doesn't appear when using the "Add" button above
                                        (because it's new and not yet in WormBase), you can enter it manually below.
                                        This is for newly generated strains that haven't been curated into WormBase yet.
                                    </Alert>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <ControlLabel>
                                                    Enter one strain per line. If possible, enter the strain name followed by genotype followed by species, separated by comma. <br/>
                                                    e.g. PMD153, (<i>vhp-1(sa366) II; egIs1 [dat-1p::GFP]</i>), <i>C. elegans</i>
                                                </ControlLabel>
                                                <FormControl componentClass="textarea" rows="5" placeholder="Enter new strains not yet in WormBase here, one per line"
                                                             value={otherStrains.map(a => a.name).join("\n")}
                                                             onChange={e => dispatch(setOtherStrains(e.target.value.split("\n").map((a, index) => {
                                                                 return {id: index + 1, name: a}})))}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <SaveButton
                    payload={{
                        alleles_list: transformEntitiesIntoAfpString(alleles, ""),
                        allele_seq_change: getCheckboxDBVal(sequenceChange.checked),
                        other_alleles: JSON.stringify(otherAlleles),
                        strains_list: transformEntitiesIntoAfpString(strains, ""),
                        other_strains: JSON.stringify(otherStrains),
                        passwd: paperPassword
                    }}
                    widgetName={WIDGET.GENETICS}
                    buttonText="Save and go to next section"
                />
            </div>
            <Modal show={strainAlreadyPresentError} onHide={() => dispatch(setStrainAlreadyPresentError(false))}>
                <Modal.Header closeButton>
                    <Modal.Title>One or more strains were replaced by the added strain(s)</Modal.Title>
                </Modal.Header>
                <Modal.Body>Some of the added strains were already present in the final list and were replaced by the added strains</Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => dispatch(setStrainAlreadyPresentError(false))}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

Genetics.propTypes = {
    hideAlleles: PropTypes.bool,
    hideStrains: PropTypes.bool,
    toggleEntityVisibilityCallback: PropTypes.func.isRequired
}

Genetics.defaultProps = {
    hideAlleles: false,
    hideStrains: false
}

export default Genetics;
