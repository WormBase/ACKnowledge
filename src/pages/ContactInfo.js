import React from 'react';
import {Button, FormControl, Panel} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Other extends React.Component {
    render() {
        return (
            <div>
                <AlertDismissable title="" text="In this page you can update your contact information."
                                  bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Update contact info and lineage
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        Thank you for filling out the form, as a last step please check that your
                                        contact info and lineage are up to date by clicking on the button below
                                    </div>
                                </div>
                                <br/>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <Button bsStyle="info">Update contact info and lineage</Button>
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