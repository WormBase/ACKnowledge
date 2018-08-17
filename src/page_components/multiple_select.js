import {Component} from "react";
import React from "react";
import {Alert, Button, ButtonGroup, FormControl, Glyphicon, Label, Modal} from "react-bootstrap";

class MultipleSelect extends Component {
    constructor(props, context) {
        super(props, context);
        let selected = new Set(props["selectedItems"]);
        this.state = {
            itemsNameSingular: props["itemsNameSingular"],
            itemsNamePlural: props["itemsNamePlural"],
            show: false,
            selectedItemsToDisplay: selected,
            selectedItemsAll: selected,
            availableItems: new Set(),
            itemsIdForm: undefined,
            tmpDeselectedItems: new Set(),
            tmpSelectedItems: new Set(),
            show_fetch_data_error: false,
            showMore: false
        };

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChangeWBListSelection = this.handleChangeWBListSelection.bind(this);
        this.handleChangeIdentifiedListSelection = this.handleChangeIdentifiedListSelection.bind(this);
        this.handleAddSelectedToList = this.handleAddSelectedToList.bind(this);
        this.handleRemSelectedFromList = this.handleRemSelectedFromList.bind(this);
        this.handleFilterIdChange = this.handleFilterIdChange.bind(this);
        this.setAvailableItems = this.setAvailableItems.bind(this);
    }

    handleAddSelectedToList() {
        if (this.state.tmpSelectedItems.size > 0) {
            let selectedMerged = new Set([...this.state.selectedItemsAll, ...this.state.tmpSelectedItems]);
            selectedMerged.delete("more ...");
            this.setState({
                show: false,
                selectedItemsToDisplay: selectedMerged,
                selectedItemsAll: selectedMerged,
                tmpSelectedItems: new Set()
            });
            this.props.selectedItemsCallback(selectedMerged);
        }
        else {
            this.setState({show: false});
        }
    }

    handleRemSelectedFromList() {
        if (this.state.itemsIdForm !== undefined) {
            let selOpts = [];
            let options = this.state.itemsIdForm;
            [...options].forEach(function(option){if (option.selected){ selOpts.push(option.value) }});
            if (selOpts.length !== this.state.tmpDeselectedItems.length) {
                [...options].forEach(function(option){ option.selected = false; });
            }
        }
        if (this.state.tmpDeselectedItems.size > 0) {
            let selectedNew = new Set([...this.state.selectedItemsAll].filter(x =>
                !this.state.tmpDeselectedItems.has(x)));
            this.setState({
                show: false,
                selectedItemsToDisplay: selectedNew,
                selectedItemsAll: selectedNew,
                tmpDeselectedItems: new Set()
            });
            this.props.selectedItemsCallback(selectedNew);
        }
    }

    setSelectedItems(selectedItems) {
        let selected = new Set(selectedItems);
        this.setState({
            selectedItemsToDisplay: selected,
            selectedItemsAll: selected
        });
    }

    handleClose() {
        this.setState({
            show: false,
            tmpSelectedItems: new Set(),
            show_fetch_data_error: false
        });
    }

    handleChangeWBListSelection(e) {
        let selectedOptions = new Set();
        [...e.target].forEach(function(option){if (option.selected){ selectedOptions.add(option.value) }});
        this.setState({tmpSelectedItems: selectedOptions});

    }

    handleChangeIdentifiedListSelection(e) {
        let selectedOptions = new Set();
        [...e.target].forEach(function(option){if (option.selected){ selectedOptions.add(option.value) }});
        this.setState({tmpDeselectedItems: selectedOptions, itemsIdForm: e.target});
    }

    handleFilterIdChange(e) {
        this.setState({selectedItemsToDisplay: [...this.state.selectedItemsAll].filter((item) =>
                item.startsWith(e.target.value))});
    }

    handleShow() {
        this.setState({ show: true });
    }

    setAvailableItems(wbItems) {
        if (wbItems !== undefined && wbItems !== "\n") {
            let newAvailItems = new Set(wbItems.split("\n").filter((item) => item !== ''));
            if (newAvailItems.has("more ...")) {
                newAvailItems.delete("more ...");
                this.setState({
                    showMore: true
                });
            } else {
                this.setState({
                    showMore: false
                });
            }
            this.setState({
                availableItems: newAvailItems
            });
        } else {
            this.setState({
                show_fetch_data_error: true
            });
        }
    }

    render(){
        let data_fetch_err_alert = false;
        if (this.state.show_fetch_data_error) {
            data_fetch_err_alert = <Alert bsStyle="danger">
                <Glyphicon glyph="warning-sign"/> <strong>Error</strong><br/>
                Can't download WormBase data. Try again later or contact <a href="mailto:help@wormbase.org">
                Wormbase Helpdesk</a>.
            </Alert>;
        }

        let more = false;
        if (this.state.showMore) {
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
                        <label>List of {this.state.itemsNamePlural} identified in the paper</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-7">
                        <FormControl componentClass="select" multiple
                                     onChange={this.handleChangeIdentifiedListSelection}
                                     defaultValue=""
                                     style={{height: '200px'}}>
                            {[...this.state.selectedItemsToDisplay].sort().map(item => <option>{item}</option>)}
                        </FormControl>
                    </div>
                    <div className="col-sm-5">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <Button bsStyle="info" onClick={this.handleRemSelectedFromList}>
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
                                    <Button bsStyle="info" onClick={this.handleShow}>
                                        <Glyphicon glyph="plus-sign"/>
                                        &nbsp; Add from WB {this.state.itemsNameSingular} list
                                    </Button>
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
                    <div className="col-sm-7">
                        <input className="form-control" onChange={this.handleFilterIdChange}
                               placeholder={"Start typing to filter " + this.state.itemsNamePlural + " list"}/>
                    </div>
                </div>
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select from Wormbase {this.state.itemsNameSingular} list</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {data_fetch_err_alert}
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-10">
                                    <input className="form-control"
                                           placeholder={"Search WormBase " + this.state.itemsNamePlural + " list"}
                                           ref={instance => { this.searchInput = instance; }}
                                           onKeyPress={(e) => {if (e.key === 'Enter') {this.props.searchWBFunc(this.searchInput.value)}}}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Button onClick={() => this.props.searchWBFunc(this.searchInput.value)} bsStyle="info">
                                        <Glyphicon glyph="search"/></Button>
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
                                                 onChange={this.handleChangeWBListSelection}
                                                 onDoubleClick={this.handleAddSelectedToList}>
                                        {[...this.state.availableItems].sort().map(item =>
                                            <option>{item}</option>)}
                                    </FormControl>
                                </div>
                            </div>
                            {more}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="success" onClick={this.handleAddSelectedToList}>Select</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default MultipleSelect;


