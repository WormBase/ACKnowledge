import React, {useState} from 'react';
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

const PaperLists = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [svmFilter, setSvmFilter] = useState(new Set());
    const [manualFilter, setManualFilter] = useState(new Set());
    const [curationFilter, setCurationFilter] = useState(new Set());
    const [combineFilters, setCombineFilters] = useState("AND");
    const [numPapersPerPage, setNumPapersPerPage] = useState(10);

    const addRemFilter = (datatype, filterType) => {
        let tempSet = new Set();
        if (filterType === "svm") {
            tempSet = svmFilter;
        } else if (filterType === "manual") {
            tempSet = manualFilter;
        } else if (filterType === "curation") {
            tempSet = curationFilter;
        }
        if (tempSet.has(datatype)) {
            tempSet.delete(datatype);
        } else {
            tempSet.add(datatype);
        }
        if (filterType === "svm") {
            setSvmFilter(tempSet)
        } else if (filterType === "manual") {
            setManualFilter(tempSet)
        } else if (filterType === "curation") {
            setCurationFilter(tempSet)
        }
    }

    const downloadCSV = async (url, list_type, svm_filters, manual_filters, curation_filters, combine_filters) => {
        axios.post(url, {list_type: list_type, svm_filters: svm_filters, manual_filters: manual_filters, curation_filters: curation_filters, combine_filters: combine_filters})
            .then((data) => {
                downloadFile(data["data"]["all_ids"].map(e => "WBPaper" + e).join('\n'), "papers", "text/plain", "csv", );
            })
    }

    return(
        <Container fluid>
            <Row>
                <Col sm="12">
                    &nbsp;
                </Col>
            </Row>
            <Row>
                <Col sm="12">
                    <Button onClick={() => setShowFilter(!showFilter)} aria-controls="example-collapse-text"
                            variant="outline-primary" size="sm" aria-expanded={showFilter}>
                        {showFilter ? "Hide filters and options" : "Show filters and options"}
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
                    <Collapse in={showFilter}>
                        <Card border="secondary">
                            <PapersFilters addRemFilterCallback={addRemFilter}
                                           setNumPapersPerPageCallback={(num) => setNumPapersPerPage(num)}
                                           papersPerPage={numPapersPerPage}
                                           combineFiltersCallback={(cf) => setCombineFilters(cf)}
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
                                                <PaginatedPapersList listType={'processed'} svmFilters={prepFilterString(svmFilter)} manualFilters={prepFilterString(manualFilter)} curationFilters={prepFilterString(curationFilter)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "processed", [...svmFilter].join(','), [...manualFilter].join(','), [...curationFilter].join(','), combineFilters)
                                                }}>Download CSV</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm="4">
                                        <Card className="listPanel">
                                            <Card.Header>Papers with final data submitted by authors</Card.Header>
                                            <Card.Body>
                                                <PaginatedPapersList listType={'submitted'} svmFilters={prepFilterString(svmFilter)} manualFilters={prepFilterString(manualFilter)} curationFilters={prepFilterString(curationFilter)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "submitted", [...svmFilter].join(','), [...manualFilter].join(','), [...curationFilter].join(','), combineFilters)
                                                }}>Download CSV</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm="4">
                                        <Card className="listPanel">
                                            <Card.Header>Papers with partially submitted data</Card.Header>
                                            <Card.Body>
                                                <PaginatedPapersList listType={'partial'} svmFilters={prepFilterString(svmFilter)} manualFilters={prepFilterString(manualFilter)} curationFilters={prepFilterString(curationFilter)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    this.downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "partial", [...svmFilter].join(','), [...manualFilter].join(','), [...curationFilter].join(','), combineFilters)
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
                                                <PaginatedPapersList listType={'empty'} svmFilters={prepFilterString(svmFilter)} manualFilters={prepFilterString(manualFilter)} curationFilters={prepFilterString(curationFilter)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "empty", prepFilterString(svmFilter), prepFilterString(manualFilter), prepFilterString(curationFilter), combineFilters)
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

export default withRouter(PaperLists);
