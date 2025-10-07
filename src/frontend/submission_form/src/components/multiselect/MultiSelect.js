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
    Label,
    Modal
} from 'react-bootstrap';
import AutoComplete from './AutoComplete';
import NoEntitiesSelectedModal from './NoEntitiesSelectedModal';
import AutoDetectedBadge from '../AutoDetectedBadge';
import ResetConfirmationModal from './ResetConfirmationModal';

const MultiSelect = (props) => {
    const [showNoEntitiesSelected, setShowNoEntitiesSelected] = useState(false);
    const [showAddMode, setShowAddMode] = useState(false);
    const [selectedForRemoval, setSelectedForRemoval] = useState(new Set());
    const [showRemovalMode, setShowRemovalMode] = useState(false);
    const [isVerticalLayout, setIsVerticalLayout] = useState(props.defaultListView || false);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showWbIds, setShowWbIds] = useState(props.defaultShowIds !== undefined ? props.defaultShowIds : true);
    const [showRemoveAllConfirmation, setShowRemoveAllConfirmation] = useState(false);
    const savedStateRef = useRef(null);
    const addModeRef = useRef(null);
    const removalModeRef = useRef(null);
    
    // Ensure props.items is always an array
    const items = Array.isArray(props.items) ? props.items : [];
    
    // Determine the baseline for comparison
    // If savedItems is provided, always use it as the source of truth
    // Otherwise, treat all items as additions (for widgets without saved state tracking)
    const originalItems = props.savedItems !== undefined && Array.isArray(props.savedItems)
        ? new Set(props.savedItems.map(item => item.trim()))
        : new Set(); // Empty set means all current items will be considered additions

    // No filtering needed anymore
    const filteredItems = items;

    // Calculate what's currently present - normalize by trimming spaces
    const addedItems = Array.isArray(props.addedItems) ? props.addedItems : [];
    const normalizedCurrentItems = [...items].map(item => item.trim());
    const allCurrentItems = new Set(normalizedCurrentItems);
    
    // Calculate net changes by comparing current state vs original state
    // This works correctly because:
    // 1. originalItems = what was there initially
    // 2. allCurrentItems = what's there now (items array reflects current reality)
    // 3. Net additions = currently present items that weren't originally there
    // 4. Net removals = originally present items that aren't currently there
    
    // Net additions: items currently present that weren't in the original set
    const netAdditions = [...allCurrentItems].filter(item => !originalItems.has(item));
    
    // Net removals: items that were originally present but aren't currently present
    const netRemovals = [...originalItems].filter(item => !allCurrentItems.has(item));

    // Scroll to add mode component when it becomes visible
    useEffect(() => {
        if (showAddMode && addModeRef.current) {
            setTimeout(() => {
                addModeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }, [showAddMode]);

    // Scroll to removal mode component when it becomes visible
    useEffect(() => {
        if (showRemovalMode && removalModeRef.current) {
            setTimeout(() => {
                removalModeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }, [showRemovalMode]);

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

    const handleRemoveAllConfirmed = () => {
        if (filteredItems.length > 0) {
            // Remove all items
            filteredItems.forEach(item => {
                props.remItemFunction(item);
            });
            setSelectedForRemoval(new Set());
            setShowRemovalMode(false);
        }
        setShowRemoveAllConfirmation(false);
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

    const formatItemDisplay = (item) => {
        if (!showWbIds) {
            // Hide WB IDs - show only the name part
            let itemNameIdArr = item.split(' ( ');
            return itemNameIdArr[0]; // Return just the name part
        }
        return item; // Show full item with WB ID
    };

    const handleReset = () => {
        // Remove all net additions (items that were added)
        // Find the actual item with potential trailing spaces to remove
        netAdditions.forEach(trimmedItem => {
            const actualItem = items.find(item => item.trim() === trimmedItem);
            if (actualItem) {
                props.remItemFunction(actualItem);
            }
        });
        
        // Add back all net removals (items that were removed)
        netRemovals.forEach(item => {
            props.addItemFunction(item);
        });
        
        // Clear any active modes
        setShowAddMode(false);
        setShowRemovalMode(false);
        setSelectedForRemoval(new Set());
    };

    return (
        <div className="multiselect-redesigned">
            {/* Header with title and optional TPC badge */}
            <div className="multiselect-header" style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
                <h4 style={{margin: 0, flex: 1, fontWeight: '600'}}>
                    {props.customTitle || `${props.itemsNamePlural.charAt(0).toUpperCase() + props.itemsNamePlural.slice(1)}`}
                </h4>
                {props.showTpcBadge && <AutoDetectedBadge/>}
            </div>

            {/* Subtle action buttons */}
            <div className="multiselect-actions" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Button 
                    className={`multiselect-btn-subtle ${showAddMode ? 'active-add' : ''}`}
                    bsSize="small"
                    onClick={() => {
                        setShowAddMode(!showAddMode);
                        setShowRemovalMode(false);
                        setSelectedForRemoval(new Set());
                    }}
                    style={{
                        fontSize: '12px',
                        padding: '4px 8px'
                    }}
                >
                    <Glyphicon glyph="plus" style={{fontSize: '10px', marginRight: '4px', marginLeft: '0'}}/> Add
                </Button>
                
                <Button 
                    className={`multiselect-btn-subtle ${showRemovalMode ? 'active-remove' : ''}`}
                    bsSize="small"
                    onClick={() => {
                        setShowRemovalMode(!showRemovalMode);
                        setShowAddMode(false);
                        setSelectedForRemoval(new Set());
                    }}
                    style={{
                        fontSize: '12px',
                        padding: '4px 8px'
                    }}
                >
                    <Glyphicon glyph="minus" style={{fontSize: '10px', marginRight: '4px', marginLeft: '0'}}/> Remove
                </Button>

                <Button 
                    className="multiselect-btn-subtle"
                    bsSize="small"
                    onClick={() => setShowResetConfirmation(true)}
                    disabled={netAdditions.length === 0 && netRemovals.length === 0}
                    style={{
                        fontSize: '12px',
                        padding: '4px 8px'
                    }}
                    title="Reset to last saved list"
                >
                    <Glyphicon glyph="refresh" style={{fontSize: '10px', marginRight: '4px', marginLeft: '0'}}/> Reset
                </Button>

                <div style={{display: 'flex', gap: '2px'}}>
                    <Button 
                        className={`multiselect-btn-subtle ${!isVerticalLayout ? 'active-layout' : ''}`}
                        bsSize="small"
                        onClick={() => setIsVerticalLayout(false)}
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                        title="Grid layout"
                    >
                        <Glyphicon glyph="th" style={{fontSize: '10px', marginRight: '4px', marginLeft: '0'}}/> 
                        Grid
                    </Button>
                    
                    <Button 
                        className={`multiselect-btn-subtle ${isVerticalLayout ? 'active-layout' : ''}`}
                        bsSize="small"
                        onClick={() => setIsVerticalLayout(true)}
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                        title="List layout"
                    >
                        <Glyphicon glyph="th-list" style={{fontSize: '10px', marginRight: '4px', marginLeft: '0'}}/> 
                        List
                    </Button>
                </div>

                {props.showIdToggle !== false && (
                    <Button 
                        className="multiselect-btn-subtle"
                        bsSize="small"
                        onClick={() => setShowWbIds(!showWbIds)}
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px'
                        }}
                        title={showWbIds ? "Hide WormBase IDs" : "Show WormBase IDs"}
                    >
                        <Glyphicon glyph={showWbIds ? "eye-close" : "eye-open"} style={{fontSize: '10px', marginRight: '4px', marginLeft: '0'}}/> 
                        {showWbIds ? "Hide IDs" : "Show IDs"}
                    </Button>
                )}

                <div style={{flex: 1}}></div>

                <Button 
                    bsStyle="link"
                    bsSize="small"
                    onClick={handleExport}
                    style={{
                        fontSize: '11px',
                        color: '#999',
                        padding: '2px 6px',
                        textDecoration: 'none'
                    }}
                    title="Export list"
                >
                    <Glyphicon glyph="download" style={{fontSize: '10px', marginRight: '4px'}}/> Export
                </Button>

                {props.linkWB && selectedForRemoval.size > 0 && (
                    <Button 
                        bsStyle="link"
                        bsSize="small"
                        onClick={handleViewInWB}
                        style={{
                            fontSize: '11px',
                            color: '#999',
                            padding: '2px 6px',
                            textDecoration: 'none'
                        }}
                        title="View in WormBase"
                    >
                        View in WB <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                    </Button>
                )}
            </div>

            {/* Add mode with alert banner */}
            {showAddMode && (
                <div ref={addModeRef}>
                    <Alert bsStyle="success" style={{marginBottom: '12px'}}>
                        {props.customAutoComplete ?
                            props.customAutoComplete({
                                close: () => setShowAddMode(false),
                                addItemFunction: props.addItemFunction,
                                searchType: props.searchType,
                                defaultExactMatchOnly: props.defaultExactMatchOnly,
                                exactMatchTooltip: props.exactMatchTooltip,
                                autocompletePlaceholder: props.autocompletePlaceholder,
                                itemsNamePlural: props.itemsNamePlural
                            })
                            :
                            <AutoComplete
                                close={() => setShowAddMode(false)}
                                addItemFunction={props.addItemFunction}
                                searchType={props.searchType}
                                defaultExactMatchOnly={props.defaultExactMatchOnly}
                                exactMatchTooltip={props.exactMatchTooltip}
                                autocompletePlaceholder={props.autocompletePlaceholder}
                                itemsNamePlural={props.itemsNamePlural}
                            />
                        }
                    </Alert>
                </div>
            )}

            {/* Removal mode actions */}
            {showRemovalMode && (
                <div ref={removalModeRef}>
                    <Alert bsStyle="warning" style={{marginBottom: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px'}}>
                            <span style={{flex: '1 1 auto', minWidth: '300px', marginRight: '20px'}}>
                                <strong>Removal Mode:</strong> Click on items to select them (yellow highlight), then click "Remove Selected"
                            </span>
                            <div style={{display: 'flex', gap: '5px', flexShrink: 0}}>
                                <Button
                                    bsStyle="warning"
                                    bsSize="small"
                                    onClick={handleRemoveSelected}
                                    disabled={selectedForRemoval.size === 0}
                                >
                                    <Glyphicon glyph="minus" style={{marginRight: '4px'}} />
                                    Remove Selected ({selectedForRemoval.size})
                                </Button>
                                <Button
                                    bsStyle="warning"
                                    bsSize="small"
                                    onClick={() => {
                                        if (filteredItems.length > 0) {
                                            setShowRemoveAllConfirmation(true);
                                        }
                                    }}
                                    disabled={filteredItems.length === 0}
                                >
                                    <Glyphicon glyph="minus" style={{marginRight: '4px'}} />
                                    Remove All ({filteredItems.length})
                                </Button>
                                <Button
                                    className="cancel-btn-subtle"
                                    bsSize="small"
                                    onClick={() => {
                                        setShowRemovalMode(false);
                                        setSelectedForRemoval(new Set());
                                    }}
                                    style={{
                                        fontSize: '12px',
                                        padding: '4px 8px'
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}


            {/* Items display - now more prominent */}
            <div className="multiselect-items" style={{
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                maxHeight: '350px',
                minHeight: 'auto',
                overflowY: 'auto',
                padding: (filteredItems.length === 0 && netRemovals.length === 0) ? '15px' : '8px',
                backgroundColor: '#f8f9fa',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)'
            }}>
                {(filteredItems.length === 0 && netRemovals.length === 0) ? (
                    <div style={{textAlign: 'center', color: '#999'}}>
                        {props.emptyStateText || `No ${props.itemsNamePlural} found`}
                    </div>
                ) : (
                    <div className={isVerticalLayout ? "items-list" : "items-grid"} style={{
                        display: 'flex',
                        flexDirection: isVerticalLayout ? 'column' : 'row',
                        flexWrap: isVerticalLayout ? 'nowrap' : 'wrap',
                        gap: isVerticalLayout ? '2px' : '4px'
                    }}>
                        {/* Display current items */}
                        {filteredItems.sort().map((item, index) => {
                            const isSelectedForRemoval = selectedForRemoval.has(item);
                            // Check if this item is in the netAdditions list (wasn't in original tfp_ data)
                            const isNewlyAdded = netAdditions.includes(item.trim());
                            
                            return (
                                <span
                                    key={`current-${index}`}
                                    style={{
                                        cursor: 'pointer',
                                        margin: '0',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        padding: isVerticalLayout ? '4px 8px' : '6px 8px',
                                        display: isVerticalLayout ? 'block' : 'inline-block',
                                        maxWidth: isVerticalLayout ? 'none' : '250px',
                                        width: isVerticalLayout ? '100%' : 'auto',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        borderRadius: '3px',
                                        backgroundColor: isSelectedForRemoval ? '#fff3cd' : 
                                                        isNewlyAdded ? '#d4edda' : '#f5f5f5',
                                        border: `1px solid ${isSelectedForRemoval ? '#ffc107' : 
                                                              isNewlyAdded ? '#28a745' : '#868e96'}`,
                                        color: isSelectedForRemoval ? '#856404' : 
                                               isNewlyAdded ? '#155724' : '#343a40',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleItemClick(item)}
                                    title={item}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = isVerticalLayout ? 'translateX(2px)' : 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = isVerticalLayout ? 'translateX(0)' : 'translateY(0)';
                                        e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    {isNewlyAdded && <Glyphicon glyph="plus" style={{marginRight: '6px', fontSize: '11px'}}/>}
                                    {(() => {
                                        const displayItem = formatItemDisplay(item);
                                        return isVerticalLayout ? displayItem : (displayItem.length > 30 ? displayItem.substring(0, 30) + '...' : displayItem);
                                    })()}
                                </span>
                            );
                        })}
                        
                        {/* Display removed items with strikethrough */}
                        {netRemovals.sort().map((item, index) => (
                            <span
                                key={`removed-${index}`}
                                style={{
                                    cursor: 'pointer',
                                    margin: '0',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    padding: isVerticalLayout ? '4px 8px' : '6px 8px',
                                    display: isVerticalLayout ? 'block' : 'inline-block',
                                    maxWidth: isVerticalLayout ? 'none' : '250px',
                                    width: isVerticalLayout ? '100%' : 'auto',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    borderRadius: '3px',
                                    backgroundColor: '#ffebee',
                                    border: '1px solid #dc3545',
                                    color: '#721c24',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease',
                                    textDecoration: 'line-through',
                                    opacity: 0.8
                                }}
                                onClick={() => {
                                    // Re-add the removed item when clicked
                                    props.addItemFunction(item);
                                }}
                                title={`${item} (removed - click to restore)`}
                                onMouseOver={(e) => {
                                    e.target.style.transform = isVerticalLayout ? 'translateX(2px)' : 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                    e.target.style.opacity = '1';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = isVerticalLayout ? 'translateX(0)' : 'translateY(0)';
                                    e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                    e.target.style.opacity = '0.8';
                                }}
                            >
                                <Glyphicon glyph="minus" style={{marginRight: '6px', fontSize: '11px'}}/>
                                {(() => {
                                    const displayItem = formatItemDisplay(item);
                                    return isVerticalLayout ? displayItem : (displayItem.length > 30 ? displayItem.substring(0, 30) + '...' : displayItem);
                                })()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary info - more prominent */}
            <div style={{
                marginTop: '10px', 
                fontSize: '12px', 
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderTop: '1px solid #dee2e6',
                backgroundColor: '#f8f9fa'
            }}>
                <span>
                    {filteredItems.length} {props.itemsNamePlural}
                </span>
                <div style={{display: 'flex', gap: '12px'}}>
                    <span style={{color: netAdditions.length > 0 ? '#28a745' : '#999', fontWeight: '600'}}>
                        {netAdditions.length} added
                    </span>
                    <span style={{color: netRemovals.length > 0 ? '#dc3545' : '#999', fontWeight: '600'}}>
                        {netRemovals.length} removed
                    </span>
                </div>
            </div>

            <NoEntitiesSelectedModal 
                show={showNoEntitiesSelected} 
                close={() => setShowNoEntitiesSelected(false)}
            />
            
            <ResetConfirmationModal
                show={showResetConfirmation}
                onHide={() => setShowResetConfirmation(false)}
                onConfirm={() => {
                    handleReset();
                    setShowResetConfirmation(false);
                }}
                itemsNamePlural={props.itemsNamePlural}
                netAdditions={netAdditions.length}
                netRemovals={netRemovals.length}
            />
            
            {/* Remove All Confirmation Modal */}
            <Modal show={showRemoveAllConfirmation} onHide={() => setShowRemoveAllConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Remove All {props.itemsNamePlural && props.itemsNamePlural.charAt(0).toUpperCase() + props.itemsNamePlural.slice(1) || 'Entities'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You are removing all {filteredItems.length} {props.itemsNamePlural || 'entities'}. Are you sure you want to proceed?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowRemoveAllConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button bsStyle="danger" onClick={handleRemoveAllConfirmed}>
                        Remove All
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

MultiSelect.propTypes = {
    items: PropTypes.array,
    addedItems: PropTypes.array,
    removedItems: PropTypes.array,
    savedItems: PropTypes.array,
    addItemFunction: PropTypes.func,
    remItemFunction: PropTypes.func,
    itemsNamePlural: PropTypes.string,
    linkWB: PropTypes.string,
    searchType: PropTypes.string,
    defaultExactMatchOnly: PropTypes.bool,
    exactMatchTooltip: PropTypes.string,
    autocompletePlaceholder: PropTypes.string.isRequired,
    customAutoComplete: PropTypes.func,
    customTitle: PropTypes.string,
    showTpcBadge: PropTypes.bool,
    emptyStateText: PropTypes.string,
    defaultListView: PropTypes.bool,
    defaultShowIds: PropTypes.bool,
    showIdToggle: PropTypes.bool
};

MultiSelect.defaultProps = {
    items: [],
    addedItems: [],
    removedItems: [],
    defaultExactMatchOnly: false,
    showTpcBadge: true,
    defaultListView: false,
    defaultShowIds: true,
    showIdToggle: true
};

export default MultiSelect;