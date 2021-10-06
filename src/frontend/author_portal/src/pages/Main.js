import React from 'react';
import EmailLogin from "./EmailLogin";
import Lists from "./Lists";
import queryString from "query-string";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {setToken} from "../redux/actions/login";
import Header from "../components/Header";


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
        <div>
            <Header/>
            <Container fluid>
                <Row>
                    <Col sm={2}>&nbsp;</Col>
                    <Col sm={8}>
                        <Container fluid>
                            <Row><Col>&nbsp;</Col></Row>
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
                    </Col>
                    <Col sm={2}>&nbsp;</Col>
                </Row>
            </Container>
        </div>
    );
}

export default Main;