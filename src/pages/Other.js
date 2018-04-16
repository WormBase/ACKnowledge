import React from 'react';
import {Button, FormControl, Panel} from "react-bootstrap";

class Other extends React.Component {
    render() {
        return (
            <div>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Other</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        Have we missed anything? Do you have any comments?
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormControl componentClass="textarea" multiple>
                                        </FormControl>

                                    </div>
                                </div>
                                <br/>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <button>Update contact info and lineage</button>
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
                    <Button bsStyle="primary" onClick={this.props.callback.bind(this, "other")}>Submit</Button>
                </div>
            </div>
        );
    }
}

export default Other;