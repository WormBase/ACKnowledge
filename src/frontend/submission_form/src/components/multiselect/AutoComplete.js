import React, { useState } from "react";
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
                    <strong>Add Mode:</strong> Enter {itemsNamePlural} to search and add them
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
                    rows="3"
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

            {searchString.trim() && (
                <EntitiesFetchAndSelect
                    searchString={searchString}
                    exactMatchOnly={exactMatchOnly}
                    addItemFunction={addItemFunction}
                    searchType={searchType}
                    close={close}
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