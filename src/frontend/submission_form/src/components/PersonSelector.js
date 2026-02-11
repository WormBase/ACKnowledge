import React, {useState, useEffect} from "react";
import {
    Alert,
    Button,
    FormControl,
    Glyphicon,
    Modal, OverlayTrigger, Tooltip
} from "react-bootstrap";
import {setPerson} from "../redux/actions/personActions";
import {useDispatch, useSelector} from "react-redux";

const PersonSelector = () => {
    const dispatch = useDispatch();

    const [show_fetch_data_error, setShow_fetch_data_error] = useState(false);
    const [show, setShow] = useState(false);
    const [tmp_person_name, setTmp_person_name] = useState(undefined);
    const [tmp_person_id, setTmp_person_id] = useState(undefined);
    const [availableItems, setAvailableItems] = useState(new Set());
    const [showMore, setShowMore] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const person = useSelector((state) => state.person.person);

    const sampleQuery = "Type your name";

    // Debounce the search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Trigger search when debounced value changes
    useEffect(() => {
        if (debouncedSearch.trim()) {
            searchWB(debouncedSearch, "person");
        } else {
            setAvailableItems(new Set());
            setShowMore(false);
        }
    }, [debouncedSearch]);

    const handleClose = () => {
        setShow(false);
        setShow_fetch_data_error(false);
        setTmp_person_id(undefined);
        setTmp_person_name(undefined);
        setSearchInput("");
        setDebouncedSearch("");
        setAvailableItems(new Set());
        setShowMore(false);
    }

    const searchWB = (searchString, searchType) => {
        if (searchString !== "") {
            fetch(process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '?objectType=' + encodeURIComponent(searchType) + '&userValue=' + encodeURIComponent(searchString))
                .then(res => {
                    if (res.status === 200) {
                        return res.text();
                    } else {
                        setShow_fetch_data_error(true);
                    }
                }).then(data => {
                if (data === undefined) {
                    setShow_fetch_data_error(true);
                } else {
                    setAvailableItemsFunction(data, false);
                }
            }).catch(() => setShow_fetch_data_error(true));
        } else {
            setAvailableItemsFunction("");
        }
    }

    const setAvailableItemsFunction = (wbItems, removeAddInfo = false) => {
        const addInfoRegex = / \( ([^ ]+) \)[ ]+$/;
        if (wbItems !== undefined && wbItems !== "\n") {
            let newAvailItems = new Set(wbItems.split("\n").filter((item) => item !== ''));
            if (removeAddInfo) {
                newAvailItems = new Set([...newAvailItems].map((elem) => elem.replace(addInfoRegex, "")));
            }
            if (newAvailItems.has("more ...")) {
                newAvailItems.delete("more ...");
                setShowMore(true);
            } else {
                setShowMore(false);
            }
            setAvailableItems(newAvailItems);
        } else {
            setAvailableItems(new Set());
            setShowMore(false);
        }
    }

    let data_fetch_err_alert = false;
    if (show_fetch_data_error) {
        data_fetch_err_alert = <Alert bsStyle="danger">
            <Glyphicon glyph="warning-sign"/> <strong>Error</strong><br/>
            Can't download WormBase data. Try again later or contact <a href="mailto:help@wormbase.org">
            Wormbase Helpdesk</a>.
        </Alert>;
    }
    let more = false;
    if (showMore) {
        more =
            <div className="row">
                <div className="col-sm-12">
                    Some results matching the query have been omitted. Try a different query to narrow down the results.
                </div>
            </div>
    }
    const isUserMissing = !person.personId;

    return (
        <div className="person-selector-compact">
            {isUserMissing && (
                <Alert bsStyle="warning" style={{marginBottom: '10px'}}>
                    <Glyphicon glyph="warning-sign" style={{marginRight: '6px'}} />
                    <strong>User not identified.</strong> Please select your identity using the
                    "Select user" button below before submitting.
                </Alert>
            )}
            <div style={{marginBottom: '8px'}}>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '2px'}}>
                    Author/Community Curator:
                </div>
                <div style={{fontSize: '14px', fontWeight: 'bold', color: isUserMissing ? '#a94442' : '#333'}}>
                    {isUserMissing ? 'Not identified' : `${person.name} (WBPerson${person.personId})`}
                </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '8px'}}>
                <OverlayTrigger overlay={<Tooltip id="tooltip">{isUserMissing ? 'You must select your identity before submitting' : 'Change the submitter to ensure proper attribution of your curation contribution'}</Tooltip>}>
                    <Button
                        className={isUserMissing ? '' : 'change-user-btn-subtle'}
                        bsStyle={isUserMissing ? 'warning' : 'default'}
                        bsSize="small"
                        onClick={() => setShow(true)}
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                    >
                        {isUserMissing ? 'Select user' : 'Change user'}
                    </Button>
                </OverlayTrigger>
                
                <OverlayTrigger overlay={<Tooltip id="tooltip">Register as a WormBase person to receive credit for your curation contributions</Tooltip>}>
                    <a 
                        href="https://wormbase.org/submissions/person.cgi" 
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
                        Request WBPerson <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                    </a>
                </OverlayTrigger>
                
                <OverlayTrigger overlay={<Tooltip id="tooltip">Access the author portal to curate information for your other papers</Tooltip>}>
                    <a 
                        href="https://acp.acknowledge.textpressolab.com" 
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
                        ACKnowledge Author Portal <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                    </a>
                </OverlayTrigger>
            </div>
            <Modal show={show} onHide={handleClose} bsSize="large">
                <Modal.Header closeButton>
                    <Modal.Title>Select from Authors/Community Curators list</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{minHeight: '400px'}}>
                    {data_fetch_err_alert}
                    <div style={{marginBottom: '16px'}}>
                        <label style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block'}}>
                            Search for your name:
                        </label>
                        <input 
                            className="form-control"
                            placeholder={sampleQuery}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{width: '100%'}}
                        />
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                        <label style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block'}}>
                            Select from results ({availableItems.size} found):
                        </label>
                        <FormControl 
                            componentClass="select" 
                            multiple
                            style={{
                                height: '200px', 
                                width: '100%',
                                minHeight: '200px',
                                fontSize: '13px'
                            }}
                            value={tmp_person_id ? [`${tmp_person_name} ( WBPerson${tmp_person_id} )`] : []}
                            onDoubleClick={(e) => {
                                if (!e.target.value) return; // Prevent error when clicking without data
                                let fullData = e.target.value;
                                let wbRx = / \( WBPerson([0-9]+) \)/;
                                let arr = wbRx.exec(fullData);
                                if (arr && arr[1]) {
                                    fullData = fullData.replace(wbRx, "");
                                    dispatch(setPerson(fullData, arr[1]));
                                    handleClose();
                                }
                            }}
                            onChange={(e) => {
                                // Get the selected option
                                const selectedOptions = Array.from(e.target.selectedOptions);
                                if (selectedOptions.length > 0) {
                                    const selectedValue = selectedOptions[0].value;
                                    let wbRx = / \( WBPerson([0-9]+) \)/;
                                    let arr = wbRx.exec(selectedValue);
                                    if (arr && arr[1]) {
                                        let personName = selectedValue.replace(wbRx, "").trim();
                                        setTmp_person_name(personName);
                                        setTmp_person_id(arr[1]);
                                        setSearchInput(personName);
                                    }
                                }
                            }}
                        >
                            {availableItems.size === 0 ? (
                                <option disabled>Type your name above to search for Authors/Community Curators</option>
                            ) : (
                                [...availableItems].map((item, index) =>
                                    <option key={index} value={item}>{item}</option>
                                )
                            )}
                        </FormControl>
                        {more && (
                            <div style={{marginTop: '8px', fontSize: '12px', color: '#666', fontStyle: 'italic'}}>
                                Some results matching the query have been omitted. Try a more specific query to narrow down the results.
                            </div>
                        )}
                    </div>
                    
                    {tmp_person_name && (
                        <div style={{
                            backgroundColor: '#f8f9fa', 
                            padding: '12px', 
                            borderRadius: '4px',
                            border: '1px solid #dee2e6'
                        }}>
                            <strong>Selected:</strong> {tmp_person_name} (WBPerson{tmp_person_id})
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontSize: '12px', color: '#666'}}>
                        Tip: Double-click an item to select it quickly
                    </div>
                    <div>
                        <Button 
                            bsStyle="default"
                            onClick={handleClose}
                            style={{marginRight: '10px'}}
                        >
                            Cancel
                        </Button>
                        <Button 
                            bsStyle="primary"
                            onClick={() =>{
                                if (tmp_person_id !== undefined && tmp_person_name !== undefined) {
                                    dispatch(setPerson(tmp_person_name, tmp_person_id));
                                    handleClose();
                                }
                            }}
                            disabled={tmp_person_id === undefined || tmp_person_name === undefined}
                        >
                            Select User
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PersonSelector;


