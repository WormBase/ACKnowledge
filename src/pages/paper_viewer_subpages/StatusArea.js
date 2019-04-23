import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {Badge, Jumbotron, Panel} from "react-bootstrap";
import TabsArea from "./TabsArea";


class StatusArea extends React.Component {

    render() {
        let link_to_afp_form = "";
        if (this.props.link_to_afp_form !== "") {
            link_to_afp_form =
                <Panel>
                    <Panel.Heading>Link to AFP submission form</Panel.Heading>
                    <Panel.Body><a href={this.props.link_to_afp_form} target="_blank">{this.props.link_to_afp_form}</a></Panel.Body>
                </Panel>
        }
        if (this.props.paper_id !== undefined) {
            return (
                <div>
                    <LoadingOverlay
                        active={this.props.isLoading}
                        spinner
                        text='Loading status info...'
                        styles={{
                            overlay: (base) => ({
                                ...base,
                                background: 'rgba(65,105,225,0.5)'
                            })
                        }}
                    >
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <Panel>
                                    <Panel.Heading>Paper Status</Panel.Heading>
                                    <Panel.Body>Processed by AFP: &nbsp; <Badge>{this.props.paper_afp_processed}</Badge><br/>
                                        Final data submitted by author: &nbsp; <Badge>{this.props.paper_author_submitted}</Badge><br/>
                                        Author has modified any data (including partial submissions): &nbsp; <Badge>{this.props.paper_author_modified}</Badge>
                                    </Panel.Body>
                                </Panel>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                {link_to_afp_form}
                            </div>
                        </div>
                    </LoadingOverlay>
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <TabsArea show={this.props.load_diff}/>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-2">
                            &nbsp;
                        </div>
                        <div className="col-sm-8">
                            <Jumbotron>
                                <h3>Paper not loaded</h3>
                                <p>
                                    Enter the 8 digit ID of a paper to see its AFP curation status.
                                </p>
                            </Jumbotron>
                        </div>
                        <div className="col-sm-2">
                            &nbsp;
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default StatusArea;
