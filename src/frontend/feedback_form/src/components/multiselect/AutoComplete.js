import React, {useEffect, useState} from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import {FormControl} from "react-bootstrap";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import Alert from "react-bootstrap/lib/Alert";
import LoadingOverlay from 'react-loading-overlay';


const AutoComplete = (props) => {
    const [autocompleteIsLoading, setAutocompleteIsLoading] = useState(0);
    const [showExactMatchOnly, setShowExactMatchOnly] = useState(false);
    const [show_fetch_data_error, setShow_fetch_data_error] = useState(false);
    const [tmpSelectedItems, setTmpSelectedItems] = useState(new Set());
    const [availableItems, setAvailableItems] = useState(new Set());
    const [showMore, setShowMore] = useState(false);
    const [searchString, setSearchString] = useState('');

    useEffect(() => {
        searchWB(searchString, props.searchType).then();
    }, [searchString])

    useEffect(() => {
        searchWB(searchString, props.searchType).then();
    }, [showExactMatchOnly]);

    const handleChangeWBListSelection = (e) => {
        let selectedOptions = new Set();
        [...e.target].forEach(function(option){if (option.selected){ selectedOptions.add(option.value) }});
        setTmpSelectedItems(selectedOptions);
    }

    const handleAddSelectedToList = () => {
        if (tmpSelectedItems.size > 0) {
            [...tmpSelectedItems].forEach((item) => {
               props.addItemFunction(item);
            });
        }
    }

    const changeAvailableItems = (wbItems, removeAddInfo = false) => {
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
            setAvailableItems(newAvailItems)
        } else {
            setAvailableItems(new Set());
            setShowMore(false);
        }
    }

    const searchWB = async (searchString, searchType) => {
        if (searchString !== "") {
            setAutocompleteIsLoading(autocompleteIsLoading => autocompleteIsLoading + 1);
            let searchEntities = searchString.split(/[\s,/\n]+/).map(e => e.trim()).filter(e => e !== "");
            let results = new Array(searchEntities.length);
            await Promise.all(searchEntities.map(async (e, idx) => {
                if (e !== '') {
                    let url = process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '&objectType=' +
                        searchType + '&userValue=' + e;
                    results[idx] = await axios.get(url);
                }
            }));
            let remAddInfo = searchType === "species";
            let resultsMergedFirst = []
            let resultsMergedSecond = []
            let toMatch = new Set(searchEntities);
            let unorderedResults = results.map(res => res.data).join('\n').split('\n');
            unorderedResults.forEach(res => {
                if (toMatch.has(res.split(' ')[0])) {
                    resultsMergedFirst.push(res);
                } else if (!showExactMatchOnly){
                    resultsMergedSecond.push(res);
                }
            });
            let resultsMerged = [...resultsMergedFirst, ...resultsMergedSecond].join('\n');
            changeAvailableItems(resultsMerged, remAddInfo);
            setAutocompleteIsLoading(autocompleteIsLoading => autocompleteIsLoading - 1);
        } else {
            changeAvailableItems("");
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

    return (
        <div>
            <label>Add from Wormbase {props.itemsNameSingular} list</label>
            <Button bsSize="xsmall" className="pull-right" bsStyle="info" onClick={props.close}>Close
                form</Button>
            {data_fetch_err_alert}
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            <div className="container-fluid" style={{paddingLeft: 0, paddingRight: 0}}>
                <div className="row">
                    <div className="col-sm-12">
                        <FormControl componentClass="textarea" rows="1" bsSize="sm"
                                     placeholder={"Autocomplete on one or more name or ID"}
                                     onChange={(e) => {setSearchString(e.target.value)}}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="pull-right">
                            <Checkbox checked={showExactMatchOnly}
                                      onClick={() => setShowExactMatchOnly(exactMatchOnly => !exactMatchOnly)}>
                                Show exact match only</Checkbox>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <LoadingOverlay
                            active={autocompleteIsLoading > 0}
                            spinner
                            text='Loading ...'
                        >
                            <FormControl componentClass="select" multiple
                                         style={{height: '180px'}}
                                         defaultValue=""
                                         onChange={handleChangeWBListSelection}
                                         onDoubleClick={handleAddSelectedToList}>
                                {[...availableItems].map(item =>
                                    <option>{item}</option>)}
                            </FormControl>
                        </LoadingOverlay>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            <Button bsStyle="info" bsSize="small" onClick={() => {
                handleAddSelectedToList();
                setTmpSelectedItems(new Set());
                setShow_fetch_data_error(false);
            }}><Glyphicon glyph="plus-sign"/>
                &nbsp; Add selected</Button>
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            {more}
        </div>
    );
}

AutoComplete.propTypes = {
    close: PropTypes.func,
    addItemFunction: PropTypes.func,
    searchType: PropTypes.string
}

export default AutoComplete

