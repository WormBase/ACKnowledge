import React, { useEffect, useState } from "react";
import LoadingOverlay from 'react-loading-overlay';
import PropTypes from "prop-types";
import { Alert, Button, FormControl, Glyphicon } from "react-bootstrap";
import { useQueries } from "react-query";
import axios from "axios";
import NoEntitiesSelectedModal from "./NoEntitiesSelectedModal";

const DiseaseFetchAndSelect = ({ searchString, exactMatchOnly, addItemFunction, close }) => {
    const [tmpSelectedItems, setTmpSelectedItems] = useState(new Set());
    const [showNoEntitiesSelected, setShowNoEntitiesSelected] = useState(false);

    useEffect(() => {
        setTmpSelectedItems(new Set());
    }, [searchString]);

    const searchEntities = searchString
        .split(/[\t,/\n]+/)
        .map(e => e.trim())
        .filter(e => e !== "");

    const apiQueries = useQueries(
        searchEntities.map(entity => ({
            queryKey: ['diseaseQuery', entity],
            queryFn: () => {
                const url = `${process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT}?objectType=humandoid&userValue=${entity}`;
                return axios.get(url);
            },
            enabled: entity.length > 0
        }))
    );

    let availableItems = [];
    let showMore = false;

    if (apiQueries.length > 0 && apiQueries.every(result => result.status === "success")) {
        let resultsMergedFirst = [];
        let resultsMergedSecond = [];
        const toMatch = new Set(searchEntities.map(entity => entity.toLowerCase()));
        const unorderedResults = apiQueries
            .map(res => res.data.data || res.data)
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

        if (resultsMerged !== undefined && resultsMerged !== "\n") {
            let newAvailItems = new Set(
                resultsMerged.split("\n").filter((item) => item !== '')
            );

            if (newAvailItems.has("more ...")) {
                newAvailItems.delete("more ...");
                showMore = true;
            }

            availableItems = [...newAvailItems];
        }
    }

    const handleSelectionChange = (e) => {
        const selectedOptions = new Set(
            [...e.target.selectedOptions].map(option => option.value)
        );
        setTmpSelectedItems(selectedOptions);
    };

    const handleDoubleClick = () => {
        if (tmpSelectedItems.size > 0) {
            addMultipleItems(false);
        }
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
            setTmpSelectedItems(new Set());
            if (close) {
                close();
            }
        } else {
            setShowNoEntitiesSelected(true);
        }
    };

    const isLoading = apiQueries.some(query => query.isLoading);
    const hasError = apiQueries.some(query => query.error);

    if (searchEntities.length === 0) {
        return (
            <div className="text-center text-muted p-3">
                <p className="text-small mb-0">
                    Enter search terms above to find matching diseases
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
                    <span style={{fontSize: '12px', color: '#666'}}>Searching Disease Ontology...</span>
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
                        Can't fetch disease data. Try again later or contact{" "}
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
                                    No matching diseases found
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

                        {availableItems.length > 0 && (
                            <div style={{display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end'}}>
                                <Button
                                    bsStyle="success"
                                    bsSize="small"
                                    onClick={() => addMultipleItems(false)}
                                    disabled={tmpSelectedItems.size === 0}
                                >
                                    <Glyphicon glyph="plus-sign" /> 
                                    Add Selected ({tmpSelectedItems.size})
                                </Button>
                                
                                <Button
                                    bsStyle="success"
                                    bsSize="small"
                                    onClick={() => addMultipleItems(true)}
                                    disabled={availableItems.length === 0}
                                >
                                    <Glyphicon glyph="plus-sign" /> 
                                    Add All ({availableItems.length})
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </LoadingOverlay>
            </div>

            <NoEntitiesSelectedModal
                show={showNoEntitiesSelected}
                close={() => setShowNoEntitiesSelected(false)}
            />
        </div>
    );
};

DiseaseFetchAndSelect.propTypes = {
    searchString: PropTypes.string.isRequired,
    exactMatchOnly: PropTypes.bool.isRequired,
    addItemFunction: PropTypes.func.isRequired,
    close: PropTypes.func
};

export default DiseaseFetchAndSelect;