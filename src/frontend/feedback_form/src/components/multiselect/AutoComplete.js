import React, {useState} from "react";
import PropTypes from "prop-types";
import {FormControl, OverlayTrigger} from "react-bootstrap";
import Checkbox from "react-bootstrap/lib/Checkbox";
import EntitiesFetchAndSelect from "./EntitiesFetchAndSelect";
import Tooltip from "react-bootstrap/lib/Tooltip";


const AutoComplete = ({close, addItemFunction, searchType, itemsNameSingular, defaultExactMatchOnly, exactMatchTooltip}) => {
    const [exactMatchOnly, setExactMatchOnly] = useState(defaultExactMatchOnly);
    const [searchString, setSearchString] = useState('');
    const [selectAll, setSelectAll] = useState(false);

    return (
        <div>
            <div className="container-fluid" style={{paddingLeft: 0, paddingRight: 0}}>
                <div className="row">
                    <div className="col-sm-12">
                        <FormControl componentClass="textarea" rows="4" bsSize="sm"
                                     placeholder={"Autocomplete on one or more name or ID. Type or paste entities separated by comma, whitespace, or newline"}
                                     onChange={(e) => {setSearchString(e.target.value)}}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <Checkbox checked={selectAll}
                                  onClick={() => setSelectAll(selectAll => !selectAll)}>
                            Select all</Checkbox>
                    </div>
                    <div className="col-sm-6">
                        {exactMatchTooltip !== false ?
                            <OverlayTrigger placement="top" overlay={<Tooltip>{exactMatchTooltip}</Tooltip>}>
                                <div className="pull-right">
                                    <Checkbox checked={exactMatchOnly}
                                              onClick={() => setExactMatchOnly(exactMatchOnly => !exactMatchOnly)}>
                                        Exact match only</Checkbox>
                                </div>
                            </OverlayTrigger>
                            :
                            <div className="pull-right">
                                <Checkbox checked={exactMatchOnly}
                                          onClick={() => setExactMatchOnly(exactMatchOnly => !exactMatchOnly)}>
                                    Exact match only
                                </Checkbox>
                            </div>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <EntitiesFetchAndSelect close={close} searchString={searchString} exactMatchOnly={exactMatchOnly}
                                                addItemFunction={addItemFunction} searchType={searchType} selectAll={selectAll} />
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
    itemsNameSingular: PropTypes.string,
    exactMatchTooltip: PropTypes.string
}

AutoComplete.defaultProps = {
    exactMatchTooltip: false
}

export default AutoComplete

