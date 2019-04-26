import React from 'react';
import {Panel, Tab, Tabs} from "react-bootstrap";
import PanelBody from "react-bootstrap/es/PanelBody";
import PanelHeading from "react-bootstrap/es/PanelHeading";
import PaginatedPapersList from "../page_components/PaginatedPapersList";
import {withRouter} from "react-router-dom";



class Lists extends React.Component {
    constructor(props, context) {
        super(props, context);
        let url = document.location.toString();
        let activeTabKey = 1;
        if (url.match('#')) {
            activeTabKey = parseInt(url.split('#')[1])
        }
        this.state = {
            list_papers_processed: [],
            list_papers_submitted: [],
            num_papers_processed: 0,
            num_papers_submitted: 0,
            processed_from_offset: 0,
            processed_count: 5,
            submitted_from_offset: 0,
            submitted_count: 20,
            active_page_processed: 1,
            active_page_submitted: 1,
            cx: 0,
            isLoading: false,
            activeTabKey: activeTabKey,
        };
    }

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <Panel>
                            <PanelHeading>Lists of Paper IDs in the system</PanelHeading>
                            <PanelBody>
                                <Tabs defaultActiveKey={this.state.activeTabKey} id="uncontrolled-tab-example">
                                    <Tab eventKey={1} title="Papers processed by the new AFP">
                                        <PaginatedPapersList listType="processed" />
                                    </Tab>
                                    <Tab eventKey={2} title="Papers with final data submitted by authors">
                                        <PaginatedPapersList listType="submitted" />
                                    </Tab>
                                    <Tab eventKey={3} title="Papers with partially submitted data">
                                        <PaginatedPapersList listType="partial" />
                                    </Tab>
                                </Tabs>
                            </PanelBody>
                        </Panel>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Lists);