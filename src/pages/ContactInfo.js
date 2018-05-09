import React from 'react';
import {Button, FormControl, Panel} from "react-bootstrap";

class Other extends React.Component {
    render() {
        return (
            <div>
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
                                <br/>
                                <div className="row">
                                    <div className="col-sm-12">
                                        If you have unpublished data generated during this study, we encourage you to
                                        submit it at <a href="https://www.micropublication.org" target="_blank">
                                        micropublication.org</a>
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