import React from 'react';
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import stripHtml from "string-strip-html";

const PaperListElement = ({item}) => {
    let title = stripHtml(item.title);
    const maxLength = 12;
    if (title.length > maxLength) {
        title = title.substr(0, maxLength) + "...";
    }
    return (
        <Container fluid>
            <Row>
                <Col sm="5">
                    <Link to={{pathname: '/paper', search: '?paper_id=' + item.paper_id}}>{item.paper_id}</Link>
                </Col>
                <Col sm="7">
                    <Link to={{pathname: '/paper', search: '?paper_id=' + item.paper_id}}><div data-toggle="tooltip" title={stripHtml(item.title)}>{title}</div></Link>
                </Col>
            </Row>
        </Container>
    );
}

export default PaperListElement;