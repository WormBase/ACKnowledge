import React from 'react';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";

class AuthorListElement extends React.Component {
    render() {
        return (
            <Container>
                <Row>
                    <Col sm={1}>
                        <Badge variant="secondary">{this.props.element.count}</Badge>
                    </Col>
                    <Col>
                        {this.props.element.name}
                    </Col>
                    <Col>
                        {this.props.element.email}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default AuthorListElement;