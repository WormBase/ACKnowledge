import React from 'react';
import {Button, FormControl, Image, Panel} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Other extends React.Component {
    render() {
        return (
            <div>
                <AlertDismissable title="" text="In this page you can provide additional information in your paper or
                comments to the WormBase team."
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
                                        <FormControl componentClass="textarea" multiple>
                                        </FormControl>

                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Do you have additional unpublished data?
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="row">
                                <div className="col-sm-10">
                                    If you have unpublished data generated during this study, we encourage you to
                                    submit it at <a href="https://www.micropublication.org" target="_blank">
                                    micropublication.org</a>
                                </div>
                                <div className="col-sm-2">
                                    <a href="https://www.micropublication.org" target="_blank">
                                        <Image src="micropub_logo.png" responsive/>
                                    </a>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "other")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Other;