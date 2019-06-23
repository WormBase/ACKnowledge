import React from 'react';
import {withRouter} from "react-router-dom";
import LateralMenu from "./LateralMenu";
import PageArea from "./PageArea";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Container fluid>
                <Row>
                    <Col sm="2" id="lateralMenu">
                        <LateralMenu/>
                    </Col>
                    <Col sm="10">
                        <PageArea/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(Main);