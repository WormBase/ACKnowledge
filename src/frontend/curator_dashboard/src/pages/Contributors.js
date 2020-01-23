import React from 'react';
import {Button, Card, Col, Container, Form, FormControl, FormGroup, Nav, Navbar, Row, Tab, Tabs} from "react-bootstrap";
import PaginatedPapersList from "../page_components/paginated_lists/PaginatedPapersList";
import {withRouter} from "react-router-dom";
import Collapse from "react-bootstrap/Collapse";
import PaginatedAuthorsList from "../page_components/paginated_lists/PaginatedAuthorsList";



class Contributors extends React.Component {
    constructor(props, context) {
        super(props, context);
        const defNumElemPerPage = 10;
        this.state = {
            list_best_contributors: [],
            num_best_contributors: 0,
            best_contributors_from_offset: 0,
            best_contributors_count: 5,
            active_page_best_contributors: 1,
            cx: 0,
            isLoading: false,
            elemPerPage: defNumElemPerPage,
            tmp_count: defNumElemPerPage,
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
                        <Container fluid>
                            <Row>
                                <Col sm="12">
                                    &nbsp;
                                </Col>
                            </Row>
                            <Row>
                                <Col sm="6">
                                    <Card className="listPanel">
                                        <Card.Header>List of best contributors</Card.Header>
                                        <Card.Body>
                                            <PaginatedAuthorsList
                                                endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributors"}
                                                elemPerPage={this.state.elemPerPage}
                                                ref={instance => {this.bestContribList = instance}}
                                            />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(Contributors);