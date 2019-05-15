import React from 'react';
import {Button, Card, Col, Container, Form, FormControl, FormGroup, Nav, Navbar, Row} from "react-bootstrap";
import PaginatedPapersList from "../page_components/PaginatedPapersList";
import {Link, withRouter} from "react-router-dom";



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
            paper_id: undefined
        };
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
                        <Form onSubmit={e => e.preventDefault()} inline>
                            <FormGroup controlId="formValidationError2"
                                       validationState={this.state.countValidationState}>
                                <Form.Label>Papers per page: &nbsp;</Form.Label>
                                <FormControl
                                    type="text" autoComplete="off" maxLength="3" size="sm"
                                    placeholder={this.state.papersPerPage}
                                    onInput={(event) => {
                                        if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) && isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
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
                                    onKeyPress={(target) => {if (target.key === 'Enter' && this.state.tmp_count > 0) {
                                        this.setState({
                                            papersPerPage: this.state.tmp_count,
                                        });
                                        this.processedList.refreshList();
                                        this.submittedList.refreshList();
                                        this.partialList.refreshList();
                                    }}}
                                />
                                <Button variant="outline-primary" size="sm" onClick={() => { if (this.state.tmp_count > 0) {
                                    this.setState({
                                        papersPerPage: this.state.tmp_count,
                                    });
                                    this.processedList.refreshList();
                                    this.submittedList.refreshList();
                                    this.partialList.refreshList();
                                }}}>Refresh</Button>
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="4">
                        <Card className="listPanel">
                            <Card.Header>Papers processed by the new AFP</Card.Header>
                            <Card.Body>
                                <PaginatedPapersList listType="processed"
                                                     papersPerPage={this.state.papersPerPage}
                                                     ref={instance => {this.processedList = instance}}
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
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(Lists);