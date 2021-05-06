import React, {useState} from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import {FormControl} from "react-bootstrap";
import Checkbox from "react-bootstrap/lib/Checkbox";
import EntitiesFetchAndSelect from "./EntitiesFetchAndSelect";


const AutoComplete = ({close, addItemFunction, searchType, itemsNameSingular}) => {
    const [exactMatchOnly, setExactMatchOnly] = useState(false);
    const [searchString, setSearchString] = useState('');

    return (
        <div>
            <label>Add from Wormbase {itemsNameSingular} list</label>
            <Button bsSize="xsmall" className="pull-right" bsStyle="info" onClick={close}>Close
                form</Button>
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
                            <Checkbox checked={exactMatchOnly}
                                      onClick={() => setExactMatchOnly(exactMatchOnly => !exactMatchOnly)}>
                                Show exact match only</Checkbox>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <EntitiesFetchAndSelect searchString={searchString} exactMatchOnly={exactMatchOnly}
                                                addItemFunction={addItemFunction} searchType={searchType} />
                    </div>
                </div>
            </div>
        </div>
    );
}

AutoComplete.propTypes = {
    close: PropTypes.func,
    addItemFunction: PropTypes.func,
    searchType: PropTypes.string,
    itemsNameSingular: PropTypes.string
}

export default AutoComplete

