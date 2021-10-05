import React from 'react';
import EmailLogin from "./EmailLogin";
import Lists from "./Lists";
import queryString from "query-string";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import logo from '../images/worm.png'
import {useSelector} from "react-redux";

const Main = () => {
    let token;
    let url = document.location.toString();
    if (url.match("\\?")) {
        token = queryString.parse(document.location.search).token;
        if (token === "") {
            token = undefined;
        }
    }
    if (token === undefined) {
        token = useSelector((state) => state.token);
    }

    return (
        <Container fluid>
            <Navbar bg="primary" variant="dark">
                <Navbar.Brand>
                    <img src={logo} height="30" width="30" />
                    &nbsp; Author First Pass
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="?token=">Login</Nav.Link>
                </Nav>
            </Navbar>
            <Row>
                <Col>
                    &nbsp;
                </Col>
            </Row>
            <Row>
                <Col>
                    {token !== undefined ?
                        <Lists token={token}/>
                        :
                        <EmailLogin/>
                    }
                </Col>
            </Row>
        </Container>
    );
}

export default Main;