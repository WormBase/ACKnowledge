import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    FormControl,
    Glyphicon,
    Image,
    OverlayTrigger,
    Tooltip,
    Alert,
    Label
} from 'react-bootstrap';
import AutoComplete from './AutoComplete';
import NoEntitiesSelectedModal from './NoEntitiesSelectedModal';

const MultiSelect = (props) => {
    const [showNoEntitiesSelected, setShowNoEntitiesSelected] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [selectedForRemoval, setSelectedForRemoval] = useState(new Set());
    const [showRemovalMode, setShowRemovalMode] = useState(false);
    const originalItemsRef = useRef(null);
    
    // Capture original items only once on first render with data - normalize them
    if (originalItemsRef.current === null && props.items.length > 0) {
        originalItemsRef.current = new Set(props.items.map(item => item.trim()));
    }
    
    const originalItems = originalItemsRef.current || new Set();

    // Filter items based on search text
    const filteredItems = props.items.filter(item => 
        item.toLowerCase().includes(filterText.toLowerCase())
    );

    // Calculate what's currently present (from any source) - normalize by trimming spaces
    const normalizedCurrentItems = [...props.items, ...props.addedItems].map(item => item.trim());
    const allCurrentItems = new Set(normalizedCurrentItems);
    
    // Net changes: compare current state vs original state (originalItems already normalized)
    const netAdditions = [...allCurrentItems].filter(item => !originalItems.has(item));
    const netRemovals = [...originalItems].filter(item => !allCurrentItems.has(item));

    const tpcTooltip = (
        <Tooltip id="tooltip">
            This field is prepopulated by Textpresso Central.
        </Tooltip>
    );

    const handleRemoveSelected = () => {
        if (selectedForRemoval.size === 0) {
            setShowNoEntitiesSelected(true);
            return;
        }
        
        selectedForRemoval.forEach(item => {
            props.remItemFunction(item);
        });
        
        setSelectedForRemoval(new Set());
        setShowRemovalMode(false);
    };

    const toggleItemForRemoval = (item) => {
        const newSelected = new Set(selectedForRemoval);
        if (newSelected.has(item)) {
            newSelected.delete(item);
        } else {
            newSelected.add(item);
        }
        setSelectedForRemoval(newSelected);
    };

    const handleItemClick = (item) => {
        if (showRemovalMode) {
            // If already in removal mode, just toggle selection
            toggleItemForRemoval(item);
        } else {
            // If not in removal mode, enter removal mode and select this item
            setShowRemovalMode(true);
            setShowAddMode(false);
            setSelectedForRemoval(new Set([item]));
        }
    };

    const handleExport = () => {
        const element = document.createElement("a");
        const file = new Blob([filteredItems.sort().join("\n")], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = props.itemsNamePlural + ".txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleViewInWB = () => {
        selectedForRemoval.forEach((item) => {
            let itemNameIdArr = item.split(' ( ');
            if (itemNameIdArr.length > 1) {
                window.open(props.linkWB + "/" + itemNameIdArr[1].slice(0, -2));
            }
        });
    };

    return (
        <div className="multiselect-redesigned">
            {/* Header with title and TPC badge */}
            <div className="multiselect-header" style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                <h5 style={{margin: 0, flex: 1}}>
                    {props.itemsNamePlural.charAt(0).toUpperCase() + props.itemsNamePlural.slice(1)} identified in the paper
                </h5>
                <OverlayTrigger placement="top" overlay={tpcTooltip}>
                    <Image src="tpc_powered.svg" width="80px"/>
                </OverlayTrigger>
            </div>

            {/* Action buttons */}
            <div className="multiselect-actions" style={{marginBottom: '12px'}}>
                <Button 
                    bsStyle={showAddMode ? "success" : "primary"}
                    bsSize="small"
                    onClick={() => {
                        setShowAddMode(!showAddMode);
                        setShowRemovalMode(false);
                        setSelectedForRemoval(new Set());
                    }}
                    style={{marginRight: '8px'}}
                >
                    <Glyphicon glyph="plus"/> Add {props.itemsNamePlural}
                </Button>
                
                <Button 
                    bsStyle={showRemovalMode ? "warning" : "primary"}
                    bsSize="small"
                    onClick={() => {
                        setShowRemovalMode(!showRemovalMode);
                        setShowAddMode(false);
                        setSelectedForRemoval(new Set());
                    }}
                    style={{marginRight: '8px'}}
                >
                    <Glyphicon glyph="minus"/> Remove {props.itemsNamePlural}
                </Button>

                <Button 
                    bsStyle="link" 
                    bsSize="small"
                    onClick={handleExport}
                    style={{marginRight: '8px'}}
                >
                    <Glyphicon glyph="download"/> Export
                </Button>

                {props.linkWB && selectedForRemoval.size > 0 && (
                    <Button 
                        bsStyle="link" 
                        bsSize="small"
                        onClick={handleViewInWB}
                    >
                        <Glyphicon glyph="new-window"/> View in WB
                    </Button>
                )}
            </div>

            {/* Add mode with alert banner */}
            {showAddMode && (
                <Alert bsStyle="success" style={{marginBottom: '12px'}}>
                    <AutoComplete 
                        close={() => setShowAddMode(false)}
                        addItemFunction={props.addItemFunction}
                        searchType={props.searchType}
                        defaultExactMatchOnly={props.defaultExactMatchOnly}
                        exactMatchTooltip={props.exactMatchTooltip}
                        autocompletePlaceholder={props.autocompletePlaceholder}
                        itemsNamePlural={props.itemsNamePlural}
                    />
                </Alert>
            )}

            {/* Removal mode actions */}
            {showRemovalMode && (
                <Alert bsStyle="warning" style={{marginBottom: '12px', padding: '8px'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <span>
                            <strong>Removal Mode:</strong> Click on items below to select them for removal
                            {selectedForRemoval.size > 0 && ` (${selectedForRemoval.size} selected)`}
                        </span>
                        <div>
                            <Button 
                                bsStyle="primary"
                                bsSize="small" 
                                onClick={handleRemoveSelected}
                                disabled={selectedForRemoval.size === 0}
                                style={{marginRight: '5px'}}
                            >
                                Remove Selected
                            </Button>
                            <Button 
                                bsStyle="primary"
                                bsSize="small" 
                                onClick={() => {
                                    setShowRemovalMode(false);
                                    setSelectedForRemoval(new Set());
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Filter input */}
            {props.items.length > 5 && (
                <FormControl
                    type="text"
                    placeholder={`Filter ${props.itemsNamePlural}...`}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{marginBottom: '10px'}}
                />
            )}

            {/* Items display */}
            <div className="multiselect-items" style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: filteredItems.length === 0 ? '20px' : '8px'
            }}>
                {filteredItems.length === 0 ? (
                    <div style={{textAlign: 'center', color: '#999'}}>
                        {filterText ? `No ${props.itemsNamePlural} match your filter` : `No ${props.itemsNamePlural} found`}
                    </div>
                ) : (
                    <div className="items-grid" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                    }}>
                        {filteredItems.sort().map((item, index) => {
                            const isAdded = new Set(props.addedItems).has(item);
                            const isSelectedForRemoval = selectedForRemoval.has(item);
                            
                            return (
                                <Label
                                    key={index}
                                    bsStyle={
                                        isSelectedForRemoval ? "danger" :
                                        isAdded ? "primary" : "default"
                                    }
                                    style={{
                                        cursor: 'pointer',
                                        margin: '0',
                                        fontSize: '12px',
                                        padding: '4px 8px',
                                        display: 'inline-block',
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        border: showRemovalMode ? '2px solid transparent' : 'none',
                                        borderColor: isSelectedForRemoval ? '#d9534f' : 'transparent'
                                    }}
                                    onClick={() => handleItemClick(item)}
                                    title={item}
                                >
                                    {isAdded && <Glyphicon glyph="plus" style={{marginRight: '4px'}}/>}
                                    {item.length > 25 ? item.substring(0, 25) + '...' : item}
                                </Label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Summary info */}
            <div style={{
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>
                    Total: {filteredItems.length} {props.itemsNamePlural}
                    {filterText && ` (filtered from ${props.items.length})`}
                </span>
                <div style={{display: 'flex', gap: '15px'}}>
                    <span>
                        Added: {netAdditions.length}
                    </span>
                    <span>
                        Removed: {netRemovals.length}
                    </span>
                </div>
            </div>

            <NoEntitiesSelectedModal 
                show={showNoEntitiesSelected} 
                close={() => setShowNoEntitiesSelected(false)}
            />
        </div>
    );
};

MultiSelect.propTypes = {
    items: PropTypes.array,
    addedItems: PropTypes.array,
    removedItems: PropTypes.array,
    addItemFunction: PropTypes.func,
    remItemFunction: PropTypes.func,
    itemsNamePlural: PropTypes.string,
    linkWB: PropTypes.string,
    searchType: PropTypes.string,
    defaultExactMatchOnly: PropTypes.bool,
    exactMatchTooltip: PropTypes.string,
    autocompletePlaceholder: PropTypes.string.isRequired
};

MultiSelect.defaultProps = {
    items: [],
    addedItems: [],
    removedItems: [],
    defaultExactMatchOnly: false
};

export default MultiSelect;