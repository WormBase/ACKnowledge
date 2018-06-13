import {Component} from "react";
import React from "react";
import {Button, ButtonGroup, FormControl, Glyphicon} from "react-bootstrap";

class MultipleSelect extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            itemsNameSingular: props["itemsNameSingular"],
            itemsNamePlural: props["itemsNamePlural"]
        };
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-5">
                        <label>Add more {this.state.itemsNamePlural}</label>
                    </div>
                    <div className="col-sm-2">
                    </div>
                    <div className="col-sm-5">
                        <label>Identified {this.state.itemsNamePlural}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-5">
                        <FormControl componentClass="select" multiple style={{height: '200px'}}>
                            <option value="select">select (multiple)</option>
                            <option value="other">...</option>
                        </FormControl>
                    </div>
                    <div className="col-sm-2" align="center">
                        <ButtonGroup className="align-middle">
                            <Button bsSize="small">
                                <Glyphicon glyph="chevron-right" /> (Add)
                            </Button>
                            <br/><br/>
                            <Button bsSize="small">
                                <Glyphicon glyph="chevron-left" /> (Remove)
                            </Button>
                        </ButtonGroup>
                    </div>
                    <div className="col-sm-5">
                        <FormControl componentClass="select" multiple style={{height: '200px'}}>
                            <option value="select">select (multiple)</option>
                            <option value="other">...</option>
                        </FormControl>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-5">
                        <label>Search WormBase {this.state.itemsNameSingular} list</label>
                        <input className="form-control"/>
                    </div>
                    <div className="col-sm-2">
                    </div>
                    <div className="col-sm-5">
                        <label>Search {this.state.itemsNameSingular} list</label>
                        <input className="form-control"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default MultipleSelect;


