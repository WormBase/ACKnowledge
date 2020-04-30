import React from 'react';
import {Button, Card, Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import PaginatedPapersList from "./paper_lists/PaginatedPapersList";
import PapersFilters from "./paper_lists/PapersFilters";



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
                                                        listType="processed"
                                                        elemPerPage={this.state.papersPerPage}
                                                        filters={{svmFilters:this.state.svmFilter, manualFilters:this.state.manualFilter, curationFilters:this.state.curationFilter, combineFilters: this.state.combineFilters}}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with final data submitted by authors</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList
                                                        endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers"}
                                                        listType="submitted"
                                                        elemPerPage={this.state.papersPerPage}
                                                        filters={{svmFilters:this.state.svmFilter, manualFilters:this.state.manualFilter, curationFilters:this.state.curationFilter, combineFilters: this.state.combineFilters}}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with partially submitted data</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList
                                                        endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers"}
                                                        listType="partial"
                                                        elemPerPage={this.state.papersPerPage}
                                                        filters={{svmFilters:this.state.svmFilter, manualFilters:this.state.manualFilter, curationFilters:this.state.curationFilter, combineFilters: this.state.combineFilters}}
                                                    />
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
                                                        listType="empty"
                                                        elemPerPage={this.state.papersPerPage}
                                                        filters={{svmFilters:this.state.svmFilter, manualFilters:this.state.manualFilter, curationFilters:this.state.curationFilter, combineFilters: this.state.combineFilters}}
                                                    />
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