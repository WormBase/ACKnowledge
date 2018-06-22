import {Component} from "react";
import React from "react";
import {Button, ButtonGroup, FormControl, Glyphicon, Label, Modal} from "react-bootstrap";

class MultipleSelect extends Component {
    constructor(props, context) {
        super(props, context);
        let selected = new Set(props["selectedItems"]);
        let available = new Set(props["availableItems"]);
        let difference = new Set([...available].filter(x => !selected.has(x)));
        this.state = {
            itemsNameSingular: props["itemsNameSingular"],
            itemsNamePlural: props["itemsNamePlural"],
            show: false,
            selectedItemsToDisplay: selected,
            availableItemsToDisplay: difference,
            selectedItemsAll: selected,
            availableItemsAll: difference,
            itemsIdForm: undefined,
            tmpDeselectedItems: new Set(),
            tmpSelectedItems: new Set()
        };

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleChangeWBListSelection = this.handleChangeWBListSelection.bind(this);
        this.handleChangeIdentifiedListSelection = this.handleChangeIdentifiedListSelection.bind(this);
        this.handleAddSelectedToList = this.handleAddSelectedToList.bind(this);
        this.handleRemSelectedFromList = this.handleRemSelectedFromList.bind(this);
        this.handleFilterIdChange = this.handleFilterIdChange.bind(this);
        this.handleFilterWBChange = this.handleFilterWBChange.bind(this);
    }

    handleAddSelectedToList() {
        if (this.state.tmpSelectedItems.size > 0) {
            let selectedMerged = new Set([...this.state.selectedItemsAll, ...this.state.tmpSelectedItems]);
            let difference = new Set([...this.state.availableItemsAll].filter(x => !selectedMerged.has(x)));
            this.setState({
                show: false,
                selectedItemsToDisplay: selectedMerged,
                selectedItemsAll: selectedMerged,
                availableItemsToDisplay: difference,
                availableItemsAll: difference,
                tmpSelectedItems: new Set()
            });
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
            let availableNew = new Set([...this.state.availableItemsAll, ...this.state.tmpDeselectedItems]);
            this.setState({
                show: false,
                selectedItemsToDisplay: selectedNew,
                selectedItemsAll: selectedNew,
                availableItemsToDisplay: availableNew,
                availableItemsAll: availableNew,
                tmpDeselectedItems: new Set()
            });
        }
    }

    handleClose() {
        this.setState({
            show: false,
            tmpSelectedItems: new Set()
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

    handleFilterWBChange(e) {
        this.setState({availableItemsToDisplay: [...this.state.availableItemsAll].filter((item) =>
                item.startsWith(e.target.value))});
    }

    handleShow() {
        this.setState({ show: true });
    }

    render(){
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
                            <div className="row">
                                <div className="col-sm-12">
                                    <input className="form-control" onChange={this.handleFilterIdChange}
                                           placeholder={"Search identified " + this.state.itemsNamePlural + " list"}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select from Wormbase {this.state.itemsNameSingular} list</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <input className="form-control"
                                           placeholder={"Search WormBase " + this.state.itemsNamePlural + " list"}
                                           onChange={this.handleFilterWBChange}/>
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
                                                 onChange={this.handleChangeWBListSelection}>
                                        {[...this.state.availableItemsToDisplay].sort().map(item =>
                                            <option>{item}</option>)}
                                    </FormControl>
                                </div>
                            </div>
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


