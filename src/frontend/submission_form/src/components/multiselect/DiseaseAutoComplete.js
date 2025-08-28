import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, FormControl, Glyphicon, OverlayTrigger, Tooltip } from "react-bootstrap";
import Checkbox from "react-bootstrap/lib/Checkbox";
import DiseaseFetchAndSelect from "./DiseaseFetchAndSelect";

const DiseaseAutoComplete = ({
    close,
    addItemFunction,
    defaultExactMatchOnly,
    exactMatchTooltip,
    autocompletePlaceholder,
    itemsNamePlural
}) => {
    const [exactMatchOnly, setExactMatchOnly] = useState(defaultExactMatchOnly);
    const [searchString, setSearchString] = useState("");
    const [debouncedSearchString, setDebouncedSearchString] = useState("");

    // Debounce the search string to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchString(searchString);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchString]);

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    };

    const tooltipComponent = exactMatchTooltip ? (
        <Tooltip id="exact-match-tooltip">{exactMatchTooltip}</Tooltip>
    ) : null;

    return (
        <div style={{padding: '8px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                <span>
                    <strong>Add Mode:</strong> Enter {itemsNamePlural} to search and add them. If you need help finding a disease term, you can access the Disease Ontology <a href="https://disease-ontology.org" target="_blank" rel="noopener noreferrer">here</a>.
                </span>
                <div>
                    <Button 
                        bsStyle="primary"
                        bsSize="small" 
                        onClick={close}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
            
            <div style={{marginBottom: '12px'}}>
                <FormControl
                    componentClass="textarea"
                    rows="5"
                    bsSize="sm"
                    placeholder={autocompletePlaceholder}
                    value={searchString}
                    onChange={handleSearchChange}
                    style={{fontSize: '12px', marginBottom: '8px'}}
                />
                
                {exactMatchTooltip ? (
                    <OverlayTrigger placement="top" overlay={tooltipComponent}>
                        <div style={{fontSize: '12px'}}>
                            <Checkbox
                                checked={exactMatchOnly}
                                onChange={() => setExactMatchOnly(!exactMatchOnly)}
                                style={{margin: 0}}
                            >
                                Exact match only
                            </Checkbox>
                        </div>
                    </OverlayTrigger>
                ) : (
                    <div style={{fontSize: '12px'}}>
                        <Checkbox
                            checked={exactMatchOnly}
                            onChange={() => setExactMatchOnly(!exactMatchOnly)}
                            style={{margin: 0}}
                        >
                            Exact match only
                        </Checkbox>
                    </div>
                )}
            </div>

            {debouncedSearchString.trim() && (
                <DiseaseFetchAndSelect
                    searchString={debouncedSearchString}
                    exactMatchOnly={exactMatchOnly}
                    addItemFunction={addItemFunction}
                    close={close}
                />
            )}
        </div>
    );
};

DiseaseAutoComplete.propTypes = {
    close: PropTypes.func.isRequired,
    addItemFunction: PropTypes.func.isRequired,
    defaultExactMatchOnly: PropTypes.bool,
    exactMatchTooltip: PropTypes.string,
    autocompletePlaceholder: PropTypes.string.isRequired,
    itemsNamePlural: PropTypes.string.isRequired
};

DiseaseAutoComplete.defaultProps = {
    defaultExactMatchOnly: false,
    exactMatchTooltip: null
};

export default DiseaseAutoComplete;