import React from 'react';
import {Button, Card, Col, Container, Form, FormControl, FormGroup, Nav, Navbar, Row, Tab, Tabs} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import PaginatedPapersList from "../page_components/paginated_lists/PaginatedPapersList";


class PaperLists extends React.Component {
    constructor(props, context) {
        super(props, context);
        let url = document.location.toString();
        let activeTabKey = 1;
        if (url.match('#')) {
            activeTabKey = parseInt(url.split('#')[1])
        }
        const defNumPapersPerPage = 10;

        this.state = {
            list_papers_processed: [],
            list_papers_submitted: [],
            num_papers_processed: 0,
            num_papers_submitted: 0,
            processed_from_offset: 0,
            processed_count: 5,
            submitted_from_offset: 0,
            submitted_count: defNumPapersPerPage,
            active_page_processed: 1,
            active_page_submitted: 1,
            cx: 0,
            isLoading: false,
            activeTabKey: activeTabKey,
            papersPerPage: defNumPapersPerPage,
            tmp_count: defNumPapersPerPage,
            paper_id: undefined,
            filterOpen: false,
            svmFilter: new Set(),
            manualFilter: new Set(),
        };

        this.toggleFilter = this.toggleFilter.bind(this);
    }

    toggleFilter() {
        this.setState({filterOpen: !this.state.filterOpen})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }

    addRemFilter(Datatype, filterType) {
        let tempSet = new Set();
        if (filterType === "svm") {
            tempSet = this.state.svmFilter;
        } else if (filterType === "manual") {
            tempSet = this.state.manualFilter;
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
        }

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
                                <Container fluid>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            <Card>
                                                <Card.Header>Data Extraction Info</Card.Header>
                                                <Card.Body>
                                                    <h5>Datatype: threshold (CURRENT)</h5>
                                                    <h6>gene: 2, protein: 2, allele: 2, strain: 1, species: 10, transgene: 1</h6>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            <Card>
                                                <Card.Header>Filter paper lists by flagged data types</Card.Header>
                                                <Card.Body>
                                                    <Container fluid>
                                                        <Row>
                                                            <Col sm="12">
                                                                <ul>
                                                                    <li>
                                                                        SVM filters are applied to EXTRACTED data for 'waiting for submissions' and 'partial submissions', and to SUBMITTED data for full submissions
                                                                    </li>
                                                                    <li>
                                                                        Manual filters are applied to SUBMITTED data
                                                                    </li>
                                                                </ul>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col sm="6">
                                                                <strong>Automatically flagged data types (SVMs)</strong>
                                                            </Col>
                                                            <Col sm="6">
                                                                <strong>Manually flagged data types</strong>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col sm="12">
                                                                &nbsp;
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col sm="6">
                                                                <Form.Check type="checkbox" label="Anatomic expression data in WT condition" onChange={() => this.addRemFilter("otherexpr", "svm")}/>
                                                                <Form.Check type="checkbox" label="Allele sequence change" onChange={() => this.addRemFilter("seqchange", "svm")}/>
                                                                <Form.Check type="checkbox" label="Genetic interactions" onChange={() => this.addRemFilter("geneint", "svm")}/>
                                                                <Form.Check type="checkbox" label="Physical interactions" onChange={() => this.addRemFilter("geneprod", "svm")}/>
                                                                <Form.Check type="checkbox" label="Regulatory interactions" onChange={() => this.addRemFilter("genereg", "svm")}/>
                                                                <Form.Check type="checkbox" label="Allele phenotype" onChange={() => this.addRemFilter("newmutant", "svm")}/>
                                                                <Form.Check type="checkbox" label="RNAi phenotype" onChange={() => this.addRemFilter("rnai", "svm")}/>
                                                                <Form.Check type="checkbox" label="Transgene overexpression phenotype" onChange={() => this.addRemFilter("overexpr", "svm")}/>
                                                            </Col>
                                                            <Col sm="6">
                                                                <Form.Check type="checkbox" label="Gene model correction/update" onChange={() => this.addRemFilter("structcorr", "manual")}/>
                                                                <Form.Check type="checkbox" label="Newly generated antibody" onChange={() => this.addRemFilter("antibody", "manual")}/>
                                                                <Form.Check type="checkbox" label="Site of action data" onChange={() => this.addRemFilter("siteaction", "manual")}/>
                                                                <Form.Check type="checkbox" label="Time of action data" onChange={() => this.addRemFilter("timeaction", "manual")}/>
                                                                <Form.Check type="checkbox" label="RNAseq data" onChange={() => this.addRemFilter("rnaseq", "manual")}/>
                                                                <Form.Check type="checkbox" label="Chemically induced phenotype" onChange={() => this.addRemFilter("chemphen", "manual")}/>
                                                                <Form.Check type="checkbox" label="Environmental induced phenotype" onChange={() => this.addRemFilter("envpheno", "manual")}/>
                                                                <Form.Check type="checkbox" label="Enzymatic activity" onChange={() => this.addRemFilter("catalyticact", "manual")}/>
                                                                <Form.Check type="checkbox" label="Human disease model" onChange={() => this.addRemFilter("humdis", "manual")}/>
                                                                <Form.Check type="checkbox" label="Additional type of expression data" onChange={() => this.addRemFilter("additionalexpr", "manual")}/>
                                                            </Col>
                                                        </Row>
                                                    </Container>

                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            <Card>
                                                <Card.Header>Page Options</Card.Header>
                                                <Card.Body>
                                                    <Form onSubmit={e => e.preventDefault()} inline>
                                                        <FormGroup controlId="formValidationError2"
                                                                   validationState={this.state.countValidationState}>
                                                            <Form.Label>Papers per page: &nbsp;</Form.Label>
                                                            <FormControl
                                                                type="text" autoComplete="off" maxLength="3" size="sm"
                                                                placeholder={this.state.papersPerPage}
                                                                onInput={(event) => {
                                                                    if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) &&
                                                                        isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
                                                                        this.setState({
                                                                            tmp_count: event.target.value,
                                                                            countValidationState: null
                                                                        })
                                                                    } else if (event.target.value !== "") {
                                                                        this.setState({
                                                                            countValidationState: "error"
                                                                        })
                                                                    } else {
                                                                        this.setState({
                                                                            countValidationState: null
                                                                        })
                                                                    }
                                                                }}
                                                                onKeyPress={(target) => {if (target.key === 'Enter' &&
                                                                    this.state.tmp_count > 0) {
                                                                    this.setState({
                                                                        papersPerPage: this.state.tmp_count,
                                                                    });
                                                                    this.processedList.refreshList();
                                                                    this.submittedList.refreshList();
                                                                    this.partialList.refreshList();
                                                                    this.emptyList.refreshList();
                                                                }}}
                                                            />
                                                            <Button variant="outline-primary" size="sm" onClick={() => { if (
                                                                this.state.tmp_count > 0) {
                                                                this.setState({
                                                                    papersPerPage: this.state.tmp_count,
                                                                });
                                                                this.processedList.refreshList();
                                                                this.submittedList.refreshList();
                                                                this.partialList.refreshList();
                                                                this.emptyList.refreshList();
                                                            }}}>Refresh</Button>
                                                        </FormGroup>
                                                    </Form>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                </Container>
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
                                                        ref={instance => {this.processedList = instance}}
                                                        svmFilters={this.state.svmFilter}
                                                        manualFilters={this.state.manualFilter}
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
                                                        ref={instance => {this.submittedList = instance}}
                                                        svmFilters={this.state.svmFilter}
                                                        manualFilters={this.state.manualFilter}
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
                                                        ref={instance => {this.partialList = instance}}
                                                        svmFilters={this.state.svmFilter}
                                                        manualFilters={this.state.manualFilter}
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
                                                        ref={instance => {this.emptyList = instance}}
                                                        svmFilters={this.state.svmFilter}
                                                        manualFilters={this.state.manualFilter}
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