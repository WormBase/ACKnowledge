import React from 'react';
import EmailLogin from "./EmailLogin";
import Lists from "./Lists";
import queryString from "query-string";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import logo from '../images/worm.png'
import {useDispatch, useSelector} from "react-redux";
import {setToken} from "../redux/actions/login";

const Main = () => {
    const dispatch = useDispatch();

    let token;
    let url = document.location.toString();
    if (url.match("\\?")) {
        token = queryString.parse(document.location.search).token;
        if (token === "") {
            token = undefined;
        }
    }
    if (token !== undefined) {
        dispatch(setToken(token));
    } else {
        token = useSelector((state) => state.login.token);
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
                        <Lists/>
                        :
                        <EmailLogin/>
                    }
                </Col>
            </Row>
        </Container>
    );
}

export default Main;