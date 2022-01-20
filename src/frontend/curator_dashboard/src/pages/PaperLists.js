import React, {useState} from 'react';
import {Button, Card, Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import PaginatedPapersList from "./paper_lists/PaginatedPapersList";
import PapersFilters from "./paper_lists/PapersFilters";
import axios from 'axios';
import {downloadFile} from "../lib/file";
import {useDispatch, useSelector} from "react-redux";
import {resetPaperListFilters} from "../redux/actions";


const prepFilterString = filter => {
    let outFilters = "";
    if (filter !== undefined) {
        outFilters = [...filter].join(',');
    }
    return outFilters;
}

const PaperLists = () => {
    const dispatch = useDispatch();
    const svmFilters = useSelector((state) => state.paperListFilters.svmFilters);
    const manualFilters = useSelector((state) => state.paperListFilters.manualFilters);
    const curationFilters = useSelector((state) => state.paperListFilters.curationFilters);
    const combineFilters = useSelector((state) => state.paperListFilters.combineFilters);
    const [showFilter, setShowFilter] = useState(false);
    const [numPapersPerPage, setNumPapersPerPage] = useState(10);

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
                <Col sm="2">
                    <Button onClick={() => setShowFilter(!showFilter)} aria-controls="example-collapse-text"
                            variant="outline-primary" size="sm" aria-expanded={showFilter}>
                        {showFilter ? "Hide filters and options" : "Show filters and options"}
                    </Button>
                </Col>
                <Col sm="2">
                    <Button onClick={() => dispatch(resetPaperListFilters())} aria-controls="example-collapse-text"
                            variant="outline-primary" size="sm">Reset filters
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
                            <PapersFilters setNumPapersPerPageCallback={(num) => setNumPapersPerPage(num)}
                                           papersPerPage={numPapersPerPage}
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
                                                <PaginatedPapersList listType={'processed'} svmFilters={prepFilterString(svmFilters)} manualFilters={prepFilterString(manualFilters)} curationFilters={prepFilterString(curationFilters)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "processed", [...svmFilters].join(','), [...manualFilters].join(','), [...curationFilters].join(','), combineFilters)
                                                }}>Download CSV</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm="4">
                                        <Card className="listPanel">
                                            <Card.Header>Papers with final data submitted by authors</Card.Header>
                                            <Card.Body>
                                                <PaginatedPapersList listType={'submitted'} svmFilters={prepFilterString(svmFilters)} manualFilters={prepFilterString(manualFilters)} curationFilters={prepFilterString(curationFilters)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "submitted", [...svmFilters].join(','), [...manualFilters].join(','), [...curationFilters].join(','), combineFilters)
                                                }}>Download CSV</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col sm="4">
                                        <Card className="listPanel">
                                            <Card.Header>Papers with partially submitted data</Card.Header>
                                            <Card.Body>
                                                <PaginatedPapersList listType={'partial'} svmFilters={prepFilterString(svmFilters)} manualFilters={prepFilterString(manualFilters)} curationFilters={prepFilterString(curationFilters)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    this.downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "partial", [...svmFilters].join(','), [...manualFilters].join(','), [...curationFilters].join(','), combineFilters)
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
                                                <PaginatedPapersList listType={'empty'} svmFilters={prepFilterString(svmFilters)} manualFilters={prepFilterString(manualFilters)} curationFilters={prepFilterString(curationFilters)} combineFilters={combineFilters}/>
                                                <br/>
                                                <Button size="sm" variant="link" onClick={() => {
                                                    downloadCSV(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/all_papers", "empty", prepFilterString(svmFilters), prepFilterString(manualFilters), prepFilterString(curationFilters), combineFilters)
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
