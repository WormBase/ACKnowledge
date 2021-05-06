import React from "react";
import {FormGroup} from "react-bootstrap";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import axios from "axios";
import PropTypes from "prop-types";
import {useState} from "react";

const BulkIDUpload = ({addItemFunction, close, listIDsAPI, searchType, itemsNamePlural}) => {

    const [uploadedIDs, setUploadedIDs] = useState([]);

    return (
        <div>
            <FormGroup controlId="formControlsTextarea">
                <ControlLabel>Insert a list of WB {itemsNamePlural} IDs</ControlLabel> <Button bsSize="xsmall" bsStyle="info" className="pull-right" onClick={close}>Close Form</Button>
                <br/><br/>
                <FormControl componentClass="textarea" rows="12" placeholder="each ID must start with 'WB'"
                             onChange={(e) => {
                                 setUploadedIDs(e.target.value);
                             }}/>
            </FormGroup>
            <Button bsStyle="info" bsSize="small" onClick={() => {
                let entityIDs = uploadedIDs.split("\n");
                if (entityIDs.length === 1) {
                    entityIDs = uploadedIDs.split(",");
                }
                entityIDs.forEach(async (geneId) => {
                    let data = await axios.get(listIDsAPI + geneId.trim() + '/name');
                    if (data.data) {
                        addItemFunction(data.data.name.data.label + " ( " + geneId + " )");
                    }
                });
            }}><Glyphicon glyph="plus-sign"/>&nbsp; Add to list</Button>{searchType === "gene" ? <a href="https://wormbase.org/tools/mine/gene_sanitizer.cgi" target="_blank" className="pull-right">WB gene name sanitizer</a> : ''}
        </div>
    );
}

BulkIDUpload.propTypes = {
    addItemFunction: PropTypes.func,
    close: PropTypes.func,
    listIDsAPI: PropTypes.string,
    itemsNamePlural: PropTypes.string
}

export default BulkIDUpload;