import React from 'react';
import {Button, Card, Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import PaginatedPapersList from "./paper_lists/PaginatedPapersList";
import PapersFilters from "./paper_lists/PapersFilters";
import axios from 'axios';
import {downloadFile} from "../lib/file";


const prepFilterString = filter => {
    let outFilters = "";
    if (filter !== undefined) {
        outFilters = [...filter].join(',');
    }
    return outFilters;
}

class PaperLists extends React.Component {
    constructor(props, context) {
        super(props, context);
        let url = document.location.toString();
        let activeTabKey = 1;
        if (url.match('#')) {
            activeTabKey = parseInt(url.split('#')[1])
        }
        this.state = {
            cx: 0,
            isLoading: false,
            activeTabKey: activeTabKey,
            papersPerPage: 10,
            paper_id: undefined,
            filterOpen: false,
            svmFilter: new Set(),
            manualFilter: new Set(),
            curationFilter: new Set(),
            combineFilters: 'AND'
        };

        this.toggleFilter = this.toggleFilter.bind(this);
        this.addRemFilter = this.addRemFilter.bind(this);
        this.setNumPapersPerPage = this.setNumPapersPerPage.bind(this);
        this.changeCombineFilters = this.changeCombineFilters.bind(this);
    }

    toggleFilter() {
        this.setState({filterOpen: !this.state.filterOpen})
    }

    addRemFilter(Datatype, filterType) {
        let tempSet = new Set();
        if (filterType === "svm") {
            tempSet = this.state.svmFilter;
        } else if (filterType === "manual") {
            tempSet = this.state.manualFilter;
        } else if (filterType === "curation") {
            tempSet = this.state.curationFilter;
        }
        if (tempSet.has(Datatype)) {
            tempSet.delete(Datatype);
        } else {
            tempSet.add(Datatype);
        }
        if (filterType === "svm") {
            this.setState({svmFilter: tempSet})
        } else if (filterType === "manual") {
            this.setState({manualFilter: tempSet})
        } else if (filterType === "curation") {
            this.setState({curationFilter: tempSet})
        }
    }

    changeCombineFilters(value) {
        this.setState({combineFilters: value});
    }

    setNumPapersPerPage(numPapersPerPage) {
        this.setState({
            papersPerPage: numPapersPerPage
        });
    }

    async downloadCSV(url, list_type, svm_filters, manual_filters, curation_filters, combine_filters) {
        axios.post(url, {list_type: list_type, svm_filters: svm_filters, manual_filters: manual_filters, curation_filters: curation_filters, combine_filters: combine_filters})
            .then((data) => {
                downloadFile(data["data"]["all_ids"].map(e => "WBPaper" + e).join('\n'), "papers", "text/plain", "csv", );
            })
    }

    render() {
        return(
            <Container fluid>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        <Button onClick={this.toggleFilter} aria-controls="example-collapse-text"
                                variant="outline-primary" size="sm" aria-expanded={this.state.filterOpen}>
                            {this.state.filterOpen ? "Hide filters and options" : "Show filters and options"}
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        <Collapse in={this.state.filterOpen}>
                            <Card border="secondary">
                                <PapersFilters addRemFilterCallback={this.addRemFilter}
                                               setNumPapersPerPageCallback={this.setNumPapersPerPage}
                                               papersPerPage={this.state.papersPerPage}
                                               combineFiltersCallback={this.changeCombineFilters}
                                />
                            </Card>
                        </Collapse>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        <Tabs defaultActiveKey="emailed">
                            <Tab eventKey="emailed" title="Emailed to authors">
                                <Container fluid>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers waiting for data submission</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList
                                                        endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers"}
                                                        payload={{
                                                            list_type: "processed",
                                                            count: this.state.papersPerPage,
                                                            svm_filters: prepFilterString(this.state.svmFilter),
                                                            manual_filters: prepFilterString(this.state.manualFilter),
                                                            curation_filters: prepFilterString(this.state.curationFilter),
                                                            combine_filters: this.state.combineFilters}}
                                                        elemPerPage={this.state.papersPerPage}
                                                    />
                                                    <br/>
                                                    <Button size="sm" variant="link" onClick={() => {
                                                        this.downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "processed", [...this.state.svmFilter].join(','), [...this.state.manualFilter].join(','), [...this.state.curationFilter].join(','), this.state.combineFilters)
                                                    }}>Download CSV</Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with final data submitted by authors</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList
                                                        endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers"}
                                                        payload={{
                                                            list_type: "submitted",
                                                            count: this.state.papersPerPage,
                                                            svm_filters: prepFilterString(this.state.svmFilter),
                                                            manual_filters: prepFilterString(this.state.manualFilter),
                                                            curation_filters: prepFilterString(this.state.curationFilter),
                                                            combine_filters: this.state.combineFilters
                                                        }}
                                                        elemPerPage={this.state.papersPerPage}
                                                    />
                                                    <br/>
                                                    <Button size="sm" variant="link" onClick={() => {
                                                        this.downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "submitted", [...this.state.svmFilter].join(','), [...this.state.manualFilter].join(','), [...this.state.curationFilter].join(','), this.state.combineFilters)
                                                    }}>Download CSV</Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with partially submitted data</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList
                                                        endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers"}
                                                        payload={{
                                                            list_type: "partial",
                                                            count: this.state.papersPerPage,
                                                            svm_filters: prepFilterString(this.state.svmFilter),
                                                            manual_filters: prepFilterString(this.state.manualFilter),
                                                            curation_filters: prepFilterString(this.state.curationFilter),
                                                            combine_filters: this.state.combineFilters
                                                        }}
                                                        elemPerPage={this.state.papersPerPage}
                                                    />
                                                    <br/>
                                                    <Button size="sm" variant="link" onClick={() => {
                                                        this.downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "partial", [...this.state.svmFilter].join(','), [...this.state.manualFilter].join(','), [...this.state.curationFilter].join(','), this.state.combineFilters)
                                                    }}>Download CSV</Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Container>
                            </Tab>
                            <Tab eventKey="noemail" title="Not emailed">
                                <Container fluid>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with empty entity lists</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList
                                                        endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers"}
                                                        payload={{
                                                            list_type: "empty",
                                                            count: this.state.papersPerPage,
                                                            svm_filters: prepFilterString(this.state.svmFilter),
                                                            manual_filters: prepFilterString(this.state.manualFilter),
                                                            curation_filters: prepFilterString(this.state.curationFilter),
                                                            combine_filters: this.state.combineFilters
                                                        }}
                                                        elemPerPage={this.state.papersPerPage}
                                                    />
                                                    <br/>
                                                    <Button size="sm" variant="link" onClick={() => {
                                                        this.downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "empty", prepFilterString(this.state.svmFilter), prepFilterString(this.state.manualFilter), prepFilterString(this.state.curationFilter), this.state.combineFilters)
                                                    }}>Download CSV</Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Container>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(PaperLists);
