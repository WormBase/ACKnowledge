import {Component} from "react";
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

class MultipleSelect extends Component {
    constructor(props, context) {
        super(props, context);
        let selected = new Set(props.items);
        this.state = {
            showModal: false,
            selectedItemsToDisplay: selected,
            selectedItemsAll: selected,
            availableItems: new Set(),
            itemsIdForm: undefined,
            tmpDeselectedItems: new Set(),
            tmpSelectedItems: new Set(),
            show_fetch_data_error: false,
            showMore: false,
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleChangeWBListSelection = this.handleChangeWBListSelection.bind(this);
        this.handleChangeIdentifiedListSelection = this.handleChangeIdentifiedListSelection.bind(this);
        this.handleAddSelectedToList = this.handleAddSelectedToList.bind(this);
        this.handleRemSelectedFromList = this.handleRemSelectedFromList.bind(this);
        this.handleFilterIdChange = this.handleFilterIdChange.bind(this);
        this.setAvailableItems = this.setAvailableItems.bind(this);
        this.searchWB = this.searchWB.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.items !== this.props.items) {
            this.setState({selectedItemsToDisplay: new Set(this.props.items), selectedItemsAll: new Set(this.props.items)})
        }
    }

    handleAddSelectedToList() {
        if (this.state.tmpSelectedItems.size > 0) {
            [...this.state.tmpSelectedItems].forEach((item) => {
               this.props.addItemFunction(item);
            });
        }
        this.setState({showModal: false});
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
            [...this.state.tmpDeselectedItems].forEach((item) => {
               this.props.remItemFunction(item);
            });
        }
    }

    handleClose() {
        this.setState({
            showModal: false,
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

    setAvailableItems(wbItems, removeAddInfo = false) {
        const addInfoRegex = / \( ([^ ]+) \)[ ]+$/;
        if (wbItems !== undefined && wbItems !== "\n") {
            let newAvailItems = new Set(wbItems.split("\n").filter((item) => item !== ''));
            if (removeAddInfo) {
                newAvailItems = new Set([...newAvailItems].map((elem) => elem.replace(addInfoRegex, "")));
            }
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
                availableItems: new Set(),
                showMore: false
            });
        }
    }

    searchWB(searchString, searchType) {
        if (searchString !== "") {
            fetch(process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '&objectType=' + searchType + '&userValue=' + searchString)
                .then(res => {
                    if (res.status === 200) {
                        return res.text();
                    } else {
                        this.setState({show_fetch_data_error: true})
                    }
                }).then(data => {
                if (data === undefined) {
                    this.setState({show_fetch_data_error: true})
                } else {
                    let remAddInfo = searchType === "species" || searchType === "strain";
                    this.setAvailableItems(data, remAddInfo);
                }
            }).catch(() => this.setState({show_fetch_data_error: true}));
        } else {
            this.setAvailableItems("");
        }
    }

    render(){
        const tpcTooltip = (
            <Tooltip id="tooltip">
                This field is prepopulated by Textpresso Central.
            </Tooltip>
        );
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
                        <label>List of {this.props.itemsNamePlural} identified in the paper</label> <OverlayTrigger placement="top"
                                                                                                                    overlay={tpcTooltip}>
                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
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
                                <div className="col-md-12">
                                    <Button
                                        bsStyle="info"
                                        bsClass="btn btn-info wrap-button"
                                        onClick={this.handleRemSelectedFromList}>
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
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {this.setState({showModal: true})}}>
                                        <Glyphicon glyph="plus-sign"/>
                                        &nbsp; Add from WB {this.props.itemsNameSingular} list
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
                    <div className="col-sm-6">
                        <input className="form-control" onChange={this.handleFilterIdChange}
                               placeholder={"Start typing to filter " + this.props.itemsNamePlural + " list"}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <Button bsStyle="info" className="pull-right" bsSize="xsmall" onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([[... this.state.selectedItemsToDisplay].sort().join("\n")],
                                {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = this.props.itemsNamePlural + ".txt";
                            document.body.appendChild(element); // Required for this to work in FireFox
                            element.click();
                        }}>Export .txt</Button>
                    </div>
                </div>
                <Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select from Wormbase {this.props.itemsNameSingular} list</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {data_fetch_err_alert}
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <input className="form-control"
                                           placeholder={this.props.sampleQuery}
                                           ref={instance => { this.searchInput = instance; }}
                                           onChange={(e) => {this.searchWB(e.target.value, this.props["searchType"])}}
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
                                                 onChange={this.handleChangeWBListSelection}
                                                 onDoubleClick={this.handleAddSelectedToList}>
                                        {[...this.state.availableItems].map(item =>
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

function mapStateToProps(state, ownProps) {
    return {items: ownProps.dataReaderFunction(state).elements}
}

export default connect(mapStateToProps)(MultipleSelect);


