import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {
    Badge, Button, Col, Container,
    Form, FormControl,
    ListGroup,
    ListGroupItem,
    Pagination, Row
} from "react-bootstrap";

class PaginatedSearchList extends React.Component {

    render() {
        return(
            <Container>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="2">
                        &nbsp;
                    </Col>
                    <Col sm="8">
                        <h4 className="text-center">{this.props.title}</h4>
                        <h5 className="text-center">{this.props.subtitle}</h5>
                    </Col>
                    <Col sm="2">
                        &nbsp;
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default PaginatedSearchList;