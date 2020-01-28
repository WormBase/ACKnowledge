import React from 'react';
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class PaperListElement extends React.Component {
    render() {
        let title = this.props.element.title;
        const maxLength = 20;
        if (title.length > maxLength) {
            title = title.substr(0, maxLength) + "...";
        }
        return (
            <Container fluid>
                <Row>
                    <Col sm="4">
                        <Link to={{pathname: '/paper', search: '?paper_id=' + this.props.element.paper_id}}>{this.props.element.paper_id}</Link>
                    </Col>
                    <Col sm="8">
                        <Link to={{pathname: '/paper', search: '?paper_id=' + this.props.element.paper_id}}>{title}</Link>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default PaperListElement;