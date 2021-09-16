import React from 'react';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";

const EntityListElement = ({element}) => {
    return (
        <Container>
            <Row>
                <Col sm={1}>
                    <Badge variant="secondary">{element.count}</Badge>
                </Col>
                <Col>
                    {element.name}
                </Col>
                <Col>
                    {element.id}
                </Col>
            </Row>
        </Container>
    );
}

export default EntityListElement;