import React from 'react';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";

const EntityListElement = ({item}) => {
    return (
        <Container>
            <Row>
                <Col sm={1}>
                    <Badge variant="secondary">{item.count}</Badge>
                </Col>
                <Col>
                    {item.name}
                </Col>
                <Col>
                    {item.id}
                </Col>
            </Row>
        </Container>
    );
}

export default EntityListElement;