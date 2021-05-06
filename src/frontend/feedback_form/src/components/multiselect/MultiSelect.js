import {useEffect, useState} from "react";
import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    FormControl,
    Glyphicon,
    Image,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import {connect} from "react-redux";
import AutoComplete from "./AutoComplete";
import BulkIDUpload from "./BulkIDUpload";

const MultipleSelect = (props) => {

    let selected = new Set(props.items);
    const [showAddFromWB, setAddFromWB] = useState(false);
    const [showUploadIDs, setUploadIDs] = useState(false);
    const [selectedItemsToDisplay, setSelectedItemsToDisplay] = useState(selected);
    const [selectedItemsAll, setSelectedItemsAll] = useState(selected);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsIdForm, setItemsIdForm] = useState(undefined);
    const [tmpDeselectedItems, setTmpDeselectedItems] = useState(new Set());

    useEffect(() => {
        setSelectedItemsToDisplay(new Set(props.items));
        setSelectedItemsAll(new Set(props.items));

    }, [props.items]);

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

    const tpcTooltip = (
        <Tooltip id="tooltip">
            This field is prepopulated by Textpresso Central.
        </Tooltip>
    );

    return (
        <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="row">
                <div className="col-sm-6">
                    <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <div className="row">
                            <div className="col-sm-12">
                                <label>{props.itemsNamePlural.charAt(0).toUpperCase() + props.itemsNamePlural.slice(1)} identified in the paper</label> <OverlayTrigger placement="top"
                                                                                                                       overlay={tpcTooltip}>
                                <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-8">
                                <FormControl type="text" bsSize="sm" onChange={handleFilterIdChange}
                                       placeholder={"Start typing to filter " + props.itemsNamePlural + " list"}/>
                            </div>
                            <div className="col-sm-4">
                                <Button className="pull-right" bsSize="small" onClick={() => {
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
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <FormControl componentClass="select" multiple
                                             onChange={handleChangeIdentifiedListSelection}
                                             defaultValue=""
                                             style={{height: '200px'}}>
                                    {[...selectedItemsToDisplay].sort().map(item =>
                                        <option>{item}</option>
                                    )}
                                </FormControl>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-6">
                                <Button
                                    bsStyle="info"
                                    bsSize="small"
                                    onClick={handleRemSelectedFromList}>
                                    <Glyphicon glyph="minus-sign"/>
                                    &nbsp; Remove selected
                                </Button>
                            </div>
                            <div className="col-sm-6">
                                {props.linkWB && selectedItems.length > 0 ?
                                    <Button bsSize="small" onClick={() => {
                                        selectedItems.forEach((item) => {
                                            let itemNameIdArr = item.split(' ( ');
                                            if (itemNameIdArr.length > 1) {
                                                window.open(props.linkWB + "/" + itemNameIdArr[1].slice(0, -2));
                                            }
                                        });
                                    }}>
                                        Show selected on WB
                                    </Button>
                                    : ""}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <div className="row">
                            <div className="col-sm-12">
                                {!showAddFromWB && !showUploadIDs
                                    ?
                                    <div>
                                        <br/><br/><br/><br/><br/><br/><br/>
                                        <center><Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => setAddFromWB(true)}>
                                            <Glyphicon glyph="plus-sign"/>
                                            &nbsp; Add from WB {props.itemsNameSingular} list &nbsp;
                                        </Button>
                                            <br/><br/>
                                            {!(props.hideListIDs !== undefined && props.hideListIDs === true) ?
                                                <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => setUploadIDs(true)}>
                                                    <Glyphicon glyph="upload"/>
                                                    &nbsp; Upload a list of WB IDs
                                                </Button>
                                                : ""}
                                        </center>
                                    </div>
                                    : ""}
                                {showAddFromWB ?
                                    <AutoComplete close={() => setAddFromWB(false)}
                                                  addItemFunction={props.addItemFunction}
                                                  searchType={props.searchType} />
                                    : ""}
                                {showUploadIDs ?
                                    <BulkIDUpload addItemFunction={props.addItemFunction}
                                                  close={() => setUploadIDs(false)}
                                                  searchType={props.searchType}
                                                  listIDsAPI={props.listIDsAPI}
                                    />
                                : ""}

                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state, ownProps) => {
    return {
        items: ownProps.dataReaderFunction(state).elements
    }
}

MultipleSelect.propTypes = {
    items: PropTypes.array,
    addItemFunction: PropTypes.func,
    remItemFunction: PropTypes.func,
    itemsNameSingular: PropTypes.string,
    itemsNamePlural: PropTypes.string,
    linkWB: PropTypes.string,
    hideListIDs: PropTypes.bool,
    dataReaderFunction: PropTypes.func,
    searchType: PropTypes.string,
    sampleQuery: PropTypes.string,
    listIDsAPI: PropTypes.string
}

export default connect(mapStateToProps)(MultipleSelect);


