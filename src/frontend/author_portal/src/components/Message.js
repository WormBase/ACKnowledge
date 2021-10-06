import React from 'react';
import { Col, Container, Row } from "react-bootstrap";

const Message = () => {
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

export default PaginatedSearchList;