import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {
    Badge, Button, Col, Container,
    Form, FormControl,
    ListGroup,
    ListGroupItem,
    Pagination, Row
} from "react-bootstrap";
import {Link} from "react-router-dom";

class PaperListElement extends React.Component {
    render() {
        return (
            <Link to={{pathname: '/paper', search: '?paper_id=' + this.props.item}}>{this.props.item}</Link>
        );
    }
}

export default PaperListElement;