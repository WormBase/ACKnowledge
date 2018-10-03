import React from 'react';
import {Button, FormControl, Panel} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Other extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            other: props["other"]
        };

        this.selfStateVarModifiedFunction = this.selfStateVarModifiedFunction.bind(this);
    }

    selfStateVarModifiedFunction(value, stateVarName) {
        let stateElem = {};
        stateElem[stateVarName] = value;
        this.setState(stateElem);
    }

    render() {
        return (
            <div>
                <AlertDismissable title="" text="In this page you can send comments to the WormBase team and finalize the data submission process."
                                  bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Have we missed anything? Do you have any comments?
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        Write comments here
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormControl componentClass="textarea" multiple
                                                     value={this.state.other}
                                                     onChange={(event) => {
                                                         this.props.stateVarModifiedCallback(event.target.value, "other");
                                                         this.selfStateVarModifiedFunction(event.target.value, "other");
                                                     }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "other")}>Finish and submit
                    </Button>
                </div>
            </div>
        );
    }
}

export default Other;