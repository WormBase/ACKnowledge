import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, FormControl, Glyphicon, OverlayTrigger, Tooltip } from "react-bootstrap";
import Checkbox from "react-bootstrap/lib/Checkbox";
import EntitiesFetchAndSelect from "./EntitiesFetchAndSelect";

const AutoComplete = ({
    close,
    addItemFunction,
    searchType,
    defaultExactMatchOnly,
    exactMatchTooltip,
    autocompletePlaceholder,
    itemsNamePlural
}) => {
    const [exactMatchOnly, setExactMatchOnly] = useState(defaultExactMatchOnly);
    const [searchString, setSearchString] = useState("");
    const [debouncedSearchString, setDebouncedSearchString] = useState("");
    const [tmpSelectedItems, setTmpSelectedItems] = useState(new Set());
    const [availableItems, setAvailableItems] = useState([]);
    const [hasResults, setHasResults] = useState(false);

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

    const addMultipleItems = (addAll) => {
        let itemsToAdd = tmpSelectedItems;
        
        if (addAll) {
            itemsToAdd = new Set(availableItems.map(item => item.trim()));
        }
        
        if (itemsToAdd.size > 0) {
            [...itemsToAdd].forEach((item) => {
                addItemFunction(item);
            });
            setTmpSelectedItems(new Set()); // Clear selection after adding
            // Close the add interface after successfully adding items
            close();
        }
    };

    const tooltipComponent = exactMatchTooltip ? (
        <Tooltip id="exact-match-tooltip">{exactMatchTooltip}</Tooltip>
    ) : null;

    return (
        <div style={{padding: '8px'}}>
            <div style={{marginBottom: '12px'}}>
                <div style={{marginBottom: '10px'}}>
                    <span>
                        <strong>Add Mode:</strong> Enter {itemsNamePlural} to search and add them
                    </span>
                </div>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    <Button
                        className="multiselect-btn-success"
                        bsSize="small"
                        onClick={() => addMultipleItems(false)}
                        disabled={tmpSelectedItems.size === 0}
                    >
                        <Glyphicon glyph="plus" style={{marginRight: '4px'}} />
                        Add Selected ({tmpSelectedItems.size})
                    </Button>
                    
                    <Button
                        className="multiselect-btn-success"
                        bsSize="small"
                        onClick={() => addMultipleItems(true)}
                        disabled={!hasResults}
                    >
                        <Glyphicon glyph="plus" style={{marginRight: '4px'}} />
                        Add All ({availableItems.length})
                    </Button>
                    
                    <Button 
                        className="cancel-btn-subtle"
                        bsSize="small" 
                        onClick={close}
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
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
                <EntitiesFetchAndSelect
                    searchString={debouncedSearchString}
                    exactMatchOnly={exactMatchOnly}
                    addItemFunction={addItemFunction}
                    searchType={searchType}
                    close={close}
                    onSelectedItemsChange={setTmpSelectedItems}
                    onAvailableItemsChange={setAvailableItems}
                    onHasResultsChange={setHasResults}
                />
            )}
        </div>
    );
};

AutoComplete.propTypes = {
    close: PropTypes.func.isRequired,
    addItemFunction: PropTypes.func.isRequired,
    searchType: PropTypes.string.isRequired,
    defaultExactMatchOnly: PropTypes.bool,
    exactMatchTooltip: PropTypes.string,
    autocompletePlaceholder: PropTypes.string.isRequired,
    itemsNamePlural: PropTypes.string.isRequired
};

AutoComplete.defaultProps = {
    defaultExactMatchOnly: false,
    exactMatchTooltip: null
};

export default AutoComplete;