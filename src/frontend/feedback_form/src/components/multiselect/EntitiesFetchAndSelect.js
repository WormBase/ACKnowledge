import React, {useState} from "react";
import LoadingOverlay from 'react-loading-overlay';
import PropTypes from "prop-types";
import Alert from "react-bootstrap/lib/Alert";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import {useQueries} from "react-query";
import axios from "axios";


const EntitiesFetchAndSelect = ({close, searchString, exactMatchOnly, searchType, addItemFunction, selectAll}) => {

    const [tmpSelectedItems, setTmpSelectedItems] = useState(new Set());

    const searchEntities = searchString.split(/[\s,/\n]+/).map(e => e.trim()).filter(e => e !== "");

    const apiQueries = useQueries(searchEntities.map(entity => ({
        queryKey: ['apiQuery', entity],
        queryFn: () => {
            let url = process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '&objectType=' + searchType + '&userValue=' + entity;
            return axios.get(url)
        }
    })));

    let availableItems = []
    let showMore = false;

    if (apiQueries.length > 0 && apiQueries.every(result => result.status === "success")) {
        let remAddInfo = searchType === "species";
        let resultsMergedFirst = []
        let resultsMergedSecond = []
        let toMatch = new Set(searchEntities);
        let unorderedResults = apiQueries.map(res => res.data.data).join('\n').split('\n');
        unorderedResults.forEach(res => {
            if (!exactMatchOnly) {
                resultsMergedSecond.push(res);
            } else if (toMatch.has(res.split(' ')[0]) || toMatch.has(res.split(' ')[2])) {
                resultsMergedFirst.push(res);
            }
        });
        let resultsMerged = [...resultsMergedFirst, ...resultsMergedSecond].join('\n');
        const addInfoRegex = / \( ([^ ]+) \)[ ]+$/;
        if (resultsMerged !== undefined && resultsMerged !== "\n") {
            let newAvailItems = new Set(resultsMerged.split("\n").filter((item) => item !== ''));
            if (remAddInfo) {
                newAvailItems = new Set([...newAvailItems].map((elem) => elem.replace(addInfoRegex, "")));
            }
            if (newAvailItems.has("more ...")) {
                newAvailItems.delete("more ...");
                showMore = true;
            } else {
                showMore = false;
            }
            availableItems = newAvailItems;
        } else {
            availableItems = new Set();
            showMore = false;
        }
    }

    const addMultipleItems = () => {
        let itemsToAdd = tmpSelectedItems;
        if (selectAll) {
            itemsToAdd = availableItems;
        }
        if (itemsToAdd.size > 0) {
            [...itemsToAdd].forEach((item) => {
               addItemFunction(item);
            });
        }
    }

    return (
        <div className="container-fluid" style={{paddingLeft: 0, paddingRight: 0}}>
            <div className="row">
                <div className="col-sm-12">
                    <LoadingOverlay
                        active={apiQueries.some(query => query.isLoading)}
                        spinner
                        text='Loading ...'
                    >
                        {apiQueries.some(query => query.error) ? <Alert bsStyle="danger">
                            <Glyphicon glyph="warning-sign"/> <strong>Error</strong><br/>
                            Can't download WormBase data. Try again later or contact <a href="mailto:help@wormbase.org">
                            Wormbase Helpdesk</a>.
                        </Alert> : null}
                        <FormControl componentClass="select" multiple
                                     style={{height: '170px'}}
                                     defaultValue=""
                                     onChange={(e) => setTmpSelectedItems(new Set([...e.target].filter(option => option.selected).map(option => option.value)))}
                                     onDoubleClick={addMultipleItems}>
                            {[...availableItems].map(item =>
                                <option selected={item.selected || selectAll}>{item}</option>)}
                        </FormControl>
                    </LoadingOverlay>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            <div className="row">
                <div className="col-sm-10">
                    <Button bsStyle="info" bsSize="small" onClick={() => {
                        addMultipleItems();
                        setTmpSelectedItems(new Set());
                    }}><Glyphicon glyph="plus-sign"/>
                        &nbsp; Add selected</Button>
                </div>
                <div>
                    <Button bsSize="small" onClick={close}>Back</Button>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            {showMore ? <div className="row">
                <div className="col-sm-12">
                    Some results matching the query have been omitted. Try a different query to narrow down the results.
                </div>
            </div> : null}
        </div>
    )
}

EntitiesFetchAndSelect.propTypes = {
    close: PropTypes.func,
    searchString: PropTypes.string,
    exactMatchOnly: PropTypes.bool,
    searchType: PropTypes.string,
    addItemFunction: PropTypes.func
}


export default EntitiesFetchAndSelect;
