import React, { useEffect, useState, useMemo } from "react";
import LoadingOverlay from 'react-loading-overlay';
import PropTypes from "prop-types";
import { Alert, Button, FormControl, Glyphicon } from "react-bootstrap";
import { useQueries } from "react-query";
import axios from "axios";
import NoEntitiesSelectedModal from "./NoEntitiesSelectedModal";

const EntitiesFetchAndSelect = ({ searchString, exactMatchOnly, searchType, addItemFunction, close, onSelectedItemsChange, onAvailableItemsChange, onHasResultsChange }) => {
    const [tmpSelectedItems, setTmpSelectedItems] = useState(new Set());
    const [showNoEntitiesSelected, setShowNoEntitiesSelected] = useState(false);

    useEffect(() => {
        setTmpSelectedItems(new Set());
    }, [searchString]);

    // Notify parent component when selected items change
    useEffect(() => {
        if (onSelectedItemsChange) {
            onSelectedItemsChange(tmpSelectedItems);
        }
    }, [tmpSelectedItems, onSelectedItemsChange]);


    const searchEntities = searchString
        .split(/[\t,/\n]+/)
        .map(e => e.trim())
        .filter(e => e !== "");

    const apiQueries = useQueries(
        searchEntities.map(entity => ({
            queryKey: ['apiQuery', entity],
            queryFn: () => {
                const url = `${process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT}?objectType=${encodeURIComponent(searchType)}&userValue=${encodeURIComponent(entity)}`;
                return axios.get(url);
            },
            enabled: entity.length > 0
        }))
    );

    const { availableItems, showMore } = useMemo(() => {
        let items = [];
        let hasMore = false;

        if (apiQueries.length > 0 && apiQueries.every(result => result.status === "success")) {
            const remAddInfo = searchType === "species";
            let resultsMergedFirst = [];
            let resultsMergedSecond = [];
            const toMatch = new Set(searchEntities.map(entity => entity.toLowerCase()));
            const unorderedResults = apiQueries
                .map(res => res.data.data)
                .join('\n')
                .split('\n');

            unorderedResults.forEach(res => {
                if (!exactMatchOnly) {
                    resultsMergedSecond.push(res);
                } else if (
                    toMatch.has(res.split(' ( ')[0].toLowerCase()) ||
                    (res.split(' ( ')[1] !== undefined && 
                     toMatch.has(res.split(' ( ')[1].split(' )')[0].toLowerCase()))
                ) {
                    resultsMergedFirst.push(res);
                }
            });

            const resultsMerged = [...resultsMergedFirst, ...resultsMergedSecond].join('\n');
            const addInfoRegex = / \( ([^ ]+) \)[ ]+$/;

            if (resultsMerged !== undefined && resultsMerged !== "\n") {
                let newAvailItems = new Set(
                    resultsMerged.split("\n").filter((item) => item !== '')
                );

                if (remAddInfo) {
                    newAvailItems = new Set(
                        [...newAvailItems].map((elem) => elem.replace(addInfoRegex, ""))
                    );
                }

                if (newAvailItems.has("more ...")) {
                    newAvailItems.delete("more ...");
                    hasMore = true;
                }

                items = [...newAvailItems];
            }
        }

        return { availableItems: items, showMore: hasMore };
    }, [apiQueries, exactMatchOnly, searchType, searchEntities]);

    // Notify parent component when results change
    useEffect(() => {
        if (onAvailableItemsChange) {
            onAvailableItemsChange(availableItems);
        }
        if (onHasResultsChange) {
            onHasResultsChange(availableItems.length > 0);
        }
    }, [availableItems.length]); // Only depend on the length, not the callback functions

    const handleSelectionChange = (e) => {
        const selectedOptions = new Set(
            [...e.target.selectedOptions].map(option => option.value)
        );
        setTmpSelectedItems(selectedOptions);
    };

    const handleDoubleClick = () => {
        if (tmpSelectedItems.size > 0) {
            [...tmpSelectedItems].forEach((item) => {
                addItemFunction(item);
            });
            setTmpSelectedItems(new Set()); // Clear selection after adding
            // Close the add interface after successfully adding items
            if (close) {
                close();
            }
        }
    };

    const isLoading = apiQueries.some(query => query.isLoading);
    const hasError = apiQueries.some(query => query.error);

    if (searchEntities.length === 0) {
        return (
            <div className="text-center text-muted p-3">
                <p className="text-small mb-0">
                    Enter search terms above to find matching entities
                </p>
            </div>
        );
    }

    return (
        <div>
            {isLoading && (
                <div style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    border: '1px solid #dee2e6'
                }}>
                    <style>
                        {`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            .spinning-icon {
                                animation: spin 1s linear infinite;
                            }
                        `}
                    </style>
                    <Glyphicon 
                        glyph="refresh" 
                        className="spinning-icon" 
                        style={{marginRight: '8px', color: '#007bff'}} 
                    />
                    <span style={{fontSize: '12px', color: '#666'}}>Searching WormBase...</span>
                </div>
            )}
            
            <div style={{minHeight: isLoading ? '0' : '150px'}}>
                <LoadingOverlay
                    active={false}
                    spinner={false}
                >
                {hasError && (
                    <Alert bsStyle="danger" className="mb-3">
                        <Glyphicon glyph="warning-sign" /> <strong>Error</strong><br />
                        Can't download WormBase data. Try again later or contact{" "}
                        <a href="mailto:help@wormbase.org">WormBase Helpdesk</a>.
                    </Alert>
                )}

                {!isLoading && !hasError && (
                    <>
                        <div className="mb-2">
                            <small className="text-muted">
                                Found {availableItems.length} result(s)
                                {showMore && " (some results omitted)"}
                            </small>
                        </div>

                        <FormControl
                            componentClass="select"
                            multiple
                            style={{height: '120px', fontSize: '12px'}}
                            onChange={handleSelectionChange}
                            onDoubleClick={handleDoubleClick}
                            value={[...tmpSelectedItems]}
                        >
                            {availableItems.map((item, index) => (
                                <option key={index} value={item} title={item}>
                                    {item}
                                </option>
                            ))}
                        </FormControl>

                        {availableItems.length === 0 && !isLoading && (
                            <div className="text-center text-muted p-3">
                                <p className="text-small mb-0">
                                    No matching entities found
                                </p>
                            </div>
                        )}

                        {showMore && (
                            <div className="mt-2">
                                <small className="text-muted">
                                    <Glyphicon glyph="info-sign" /> Some results were omitted. 
                                    Try more specific search terms to see all results.
                                </small>
                            </div>
                        )}
                    </>
                )}
            </LoadingOverlay>
            </div>

            <NoEntitiesSelectedModal
                show={showNoEntitiesSelected}
                onHide={() => setShowNoEntitiesSelected(false)}
            />
        </div>
    );
};

EntitiesFetchAndSelect.propTypes = {
    searchString: PropTypes.string.isRequired,
    exactMatchOnly: PropTypes.bool.isRequired,
    searchType: PropTypes.string.isRequired,
    addItemFunction: PropTypes.func.isRequired,
    close: PropTypes.func,
    onSelectedItemsChange: PropTypes.func,
    onAvailableItemsChange: PropTypes.func,
    onHasResultsChange: PropTypes.func
};

export default EntitiesFetchAndSelect;