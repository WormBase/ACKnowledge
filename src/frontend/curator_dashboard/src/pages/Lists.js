import React from 'react';
import {Button, Card, Col, Container, Form, FormControl, FormGroup, Nav, Navbar, Row, Tab, Tabs} from "react-bootstrap";
import PaginatedPapersList from "../page_components/PaginatedPapersList";
import {withRouter} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";



class Lists extends React.Component {
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
            svmFilter: new Set()
        };

        this.toggleFilter = this.toggleFilter.bind(this);
    }

    toggleFilter() {
        this.setState({filterOpen: !this.state.filterOpen})
    }

    addRemSvmFilter(svmDatatype) {
        let tempSet = this.state.svmFilter;
        if (tempSet.has(svmDatatype)) {
            tempSet.delete(svmDatatype);
        } else {
            tempSet.add(svmDatatype);
        }
        this.setState({svmFilter: tempSet})
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
                                                    <Form.Check type="checkbox" label="Allele sequence change" onChange={() => this.addRemSvmFilter("seqchange")}/>
                                                    <Form.Check type="checkbox" label="Genetic interactions" onChange={() => this.addRemSvmFilter("geneint")}/>
                                                    <Form.Check type="checkbox" label="Physical interactions" onChange={() => this.addRemSvmFilter("geneprod")}/>
                                                    <Form.Check type="checkbox" label="Regulatory interactions" onChange={() => this.addRemSvmFilter("genereg")}/>
                                                    <Form.Check type="checkbox" label="Allele phenotype" onChange={() => this.addRemSvmFilter("newmutant")}/>
                                                    <Form.Check type="checkbox" label="RNAi phenotype" onChange={() => this.addRemSvmFilter("rnai")}/>
                                                    <Form.Check type="checkbox" label="Transgene overexpression phenotype" onChange={() => this.addRemSvmFilter("overexpr")}/>
                                                    <br/>
                                                    <Form.Check type="checkbox" label="Gene model correction/update"/>
                                                    <Form.Check type="checkbox" label="Newly generated antibody"/>
                                                    <Form.Check type="checkbox" label="Site of action data"/>
                                                    <Form.Check type="checkbox" label="Time of action data"/>
                                                    <Form.Check type="checkbox" label="RNAseq data"/>
                                                    <Form.Check type="checkbox" label="Chemically induced phenotype"/>
                                                    <Form.Check type="checkbox" label="Environmental induced phenotype"/>
                                                    <Form.Check type="checkbox" label="Enzymatic activity"/>
                                                    <Form.Check type="checkbox" label="Human disease model"/>
                                                    <Form.Check type="checkbox" label="Additional type of expression data"/>
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
                                                    <PaginatedPapersList listType="processed"
                                                                         papersPerPage={this.state.papersPerPage}
                                                                         ref={instance => {this.processedList = instance}}
                                                                         svmFilters={this.state.svmFilter}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with final data submitted by authors</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList listType="submitted"
                                                                         papersPerPage={this.state.papersPerPage}
                                                                         ref={instance => {this.submittedList = instance}}
                                                                         svmFilters={this.state.svmFilter}
                                                    />
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col sm="4">
                                            <Card className="listPanel">
                                                <Card.Header>Papers with partially submitted data</Card.Header>
                                                <Card.Body>
                                                    <PaginatedPapersList listType="partial"
                                                                         papersPerPage={this.state.papersPerPage}
                                                                         ref={instance => {this.partialList = instance}}
                                                                         svmFilters={this.state.svmFilter}
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
                                                    <PaginatedPapersList listType="empty"
                                                                         papersPerPage={this.state.papersPerPage}
                                                                         ref={instance => {this.emptyList = instance}}
                                                                         svmFilters={this.state.svmFilter}
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

export default withRouter(Lists);