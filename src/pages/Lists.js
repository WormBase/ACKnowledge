import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {ListGroup, ListGroupItem, Panel, Tab, Tabs} from "react-bootstrap";
import {Link} from "react-router-dom";
import PanelBody from "react-bootstrap/es/PanelBody";
import PanelHeading from "react-bootstrap/es/PanelHeading";


class Lists extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            list_papers_processed: [],
            list_papers_submitted: [],
            cx: 0,
            isLoading: false
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    componentDidMount() {
        this.loadDataFromAPI();
    }

    loadDataFromAPI() {
        this.setState({isLoading: true});
        fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers", {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Error")
            }
        }).then(data => {
            if (data === undefined) {
                alert("Empty response")
            }
            this.setState({
                list_papers_processed: data["list_processed_ids"],
                list_papers_submitted: data["list_submitted_ids"],
                isLoading: false
            });
        }).catch((err) => {
            alert(err);
        });
    }

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        &nbsp;
                    </div>
                </div>
                <LoadingOverlay
                    active={this.state.isLoading}
                    spinner
                    text='Loading paper data...'
                    styles={{
                        overlay: (base) => ({
                            ...base,
                            background: 'rgba(65,105,225,0.5)'
                        })
                    }}
                >
                    <div className="row">
                        <div className="col-sm-12">
                            <Panel>
                                <PanelHeading>Lists of Paper IDs in the system</PanelHeading>
                                <PanelBody>
                                    <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                                        <Tab eventKey={1} title="Papers processed by the new AFP">
                                            <ListGroup>
                                                {[...this.state.list_papers_processed].sort().map(item =>
                                                    <ListGroupItem>
                                                        <Link to={{pathname: '/paper', search: '?paper_id=' + item}}>{item}</Link>
                                                    </ListGroupItem>)}
                                            </ListGroup>
                                        </Tab>
                                        <Tab eventKey={2} title="Papers with data submitted by authors">
                                            <ListGroup>
                                                {[...this.state.list_papers_submitted].sort().map(item =>
                                                    <ListGroupItem>
                                                        <Link to={{pathname: '/paper', search: '?paper_id=' + item}}>{item}</Link>
                                                    </ListGroupItem>)}
                                            </ListGroup>
                                        </Tab>
                                    </Tabs>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                </LoadingOverlay>
            </div>
        );
    }
}

export default Lists;