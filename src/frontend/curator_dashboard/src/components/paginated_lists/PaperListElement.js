import React from 'react';
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import stripHtml from "string-strip-html";

class PaperListElement extends React.Component {
    render() {
        let title = stripHtml(this.props.element.title);
        const maxLength = 12;
        if (title.length > maxLength) {
            title = title.substr(0, maxLength) + "...";
        }
        return (
            <Container fluid>
                <Row>
                    <Col sm="5">
                        <Link to={{pathname: '/paper', search: '?paper_id=' + this.props.element.paper_id}}>{this.props.element.paper_id}</Link>
                    </Col>
                    <Col sm="7">
                        <Link to={{pathname: '/paper', search: '?paper_id=' + this.props.element.paper_id}}><div data-toggle="tooltip" title={stripHtml(this.props.element.title)}>{title}</div></Link>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default PaperListElement;