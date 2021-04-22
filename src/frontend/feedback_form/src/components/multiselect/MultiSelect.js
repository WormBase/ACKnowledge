import {useEffect, useState} from "react";
import React from "react";
import {
    Alert,
    Button,
    FormControl,
    Glyphicon,
    Image,
    Modal,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import {connect} from "react-redux";

const MultipleSelect = (props) => {

    let selected = new Set(props.items);
    const [showModal, setShowModal] = useState(false);
    const [selectedItemsToDisplay, setSelectedItemsToDisplay] = useState(selected);
    const [selectedItemsAll, setSelectedItemsAll] = useState(selected);
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableItems, setAvailableItems] = useState(new Set());
    const [itemsIdForm, setItemsIdForm] = useState(undefined);
    const [tmpDeselectedItems, setTmpDeselectedItems] = useState(new Set());
    const [tmpSelectedItems, setTmpSelectedItems] = useState(new Set());
    const [show_fetch_data_error, setShow_fetch_data_error] = useState(false);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        setSelectedItemsToDisplay(new Set(props.items));
        setSelectedItemsAll(new Set(props.items));

    }, [props.items]);

    const handleAddSelectedToList = () => {
        if (tmpSelectedItems.size > 0) {
            [...tmpSelectedItems].forEach((item) => {
               props.addItemFunction(item);
            });
        }
        setShowModal(false);
    }

    const handleRemSelectedFromList = () => {
        if (itemsIdForm !== undefined) {
            let selOpts = [];
            let options = itemsIdForm;
            [...options].forEach(function(option){if (option.selected){ selOpts.push(option.value) }});
            if (selOpts.length !== tmpDeselectedItems.length) {
                [...options].forEach(function(option){ option.selected = false; });
            }
        }
        if (tmpDeselectedItems.size > 0) {
            [...tmpDeselectedItems].forEach((item) => {
               props.remItemFunction(item);
            });
        }
    }

    const handleChangeWBListSelection = (e) => {
        let selectedOptions = new Set();
        [...e.target].forEach(function(option){if (option.selected){ selectedOptions.add(option.value) }});
        setTmpSelectedItems(selectedOptions);
    }

    const handleChangeIdentifiedListSelection = (e) => {
        let selectedOptions = new Set();
        let selectedList = [];
        [...e.target].forEach(function(option){if (option.selected){
            selectedOptions.add(option.value);
            selectedList.push(option.value);
        }});
        setTmpDeselectedItems(selectedOptions);
        setItemsIdForm(e.target);
        setSelectedItems(selectedList);
    }

    const handleFilterIdChange = (e) => {
        setSelectedItemsToDisplay(new Set([...selectedItemsAll].filter(item => item.startsWith(e.target.value))));
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

    const searchWB = (searchString, searchType) => {
        if (searchString !== "") {
            fetch(process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '&objectType=' + searchType + '&userValue=' + searchString)
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
                    let remAddInfo = searchType === "species";
                    changeAvailableItems(data, remAddInfo);
                }
            }).catch(() => setShow_fetch_data_error(true));
        } else {
            changeAvailableItems("");
        }
    }

    const tpcTooltip = (
        <Tooltip id="tooltip">
            This field is prepopulated by Textpresso Central.
        </Tooltip>
    );
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
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label>List of {props.itemsNamePlural} identified in the paper</label> <OverlayTrigger placement="top"
                                                                                                                overlay={tpcTooltip}>
                    <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-7">
                    <FormControl componentClass="select" multiple
                                 onChange={handleChangeIdentifiedListSelection}
                                 defaultValue=""
                                 style={{height: '200px'}}>
                        {[...selectedItemsToDisplay].sort().map(item =>
                            <option>{item}</option>
                        )}
                    </FormControl>
                </div>
                <div className="col-sm-5">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <Button
                                    bsStyle="info"
                                    bsClass="btn btn-info wrap-button"
                                    onClick={handleRemSelectedFromList}>
                                    <Glyphicon glyph="minus-sign"/>
                                    &nbsp; Remove selected
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => setShowModal(true)}>
                                    <Glyphicon glyph="plus-sign"/>
                                    &nbsp; Add from WB {props.itemsNameSingular} list
                                </Button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                {props.linkWB && selectedItems.length > 0 ?
                                    <Button bsStyle="info" bsSize="xsmall" onClick={() => {
                                        selectedItems.forEach((item) => {
                                            let itemNameIdArr = item.split(' ( ');
                                            if (itemNameIdArr.length > 1) {
                                                window.open(props.linkWB + "/" + itemNameIdArr[1].slice(0, -2));
                                            }
                                        });
                                    }}>
                                        Show selected {props.itemsNamePlural} on WormBase
                                    </Button>
                                    : ""}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    &nbsp;
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6">
                    <input className="form-control" onChange={handleFilterIdChange}
                           placeholder={"Start typing to filter " + props.itemsNamePlural + " list"}/>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <Button bsStyle="info" className="pull-right" bsSize="xsmall" onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([[... selectedItemsToDisplay].sort().join("\n")],
                            {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = props.itemsNamePlural + ".txt";
                        document.body.appendChild(element); // Required for this to work in FireFox
                        element.click();
                    }}>Export .txt</Button>
                </div>
            </div>
            <Modal show={showModal} onHide={() => {
                setShowModal(false);
                setTmpSelectedItems(new Set());
                setShow_fetch_data_error(false);
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Select from Wormbase {props.itemsNameSingular} list</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {data_fetch_err_alert}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12">
                                <input className="form-control"
                                       placeholder={props.sampleQuery}
                                       onChange={(e) => {searchWB(e.target.value, props["searchType"])}}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <FormControl componentClass="select" multiple
                                             style={{height: '200px'}}
                                             defaultValue=""
                                             onChange={handleChangeWBListSelection}
                                             onDoubleClick={handleAddSelectedToList}>
                                    {[...availableItems].map(item =>
                                        <option>{item}</option>)}
                                </FormControl>
                            </div>
                        </div>
                        {more}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" onClick={handleAddSelectedToList}>Select</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state, ownProps) => {
    return {
        items: ownProps.dataReaderFunction(state).elements
    }
}

export default connect(mapStateToProps)(MultipleSelect);


