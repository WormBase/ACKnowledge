import React from 'react';
import EmailLogin from "./EmailLogin";
import Lists from "./Lists";
import queryString from "query-string";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
import logo from '../images/worm.png'

class Main extends React.Component {
    constructor(props, context) {
        super(props, context);
        let token = undefined;
        let url = document.location.toString();
        if (url.match("\\?")) {
            token = queryString.parse(document.location.search).token;
            if (token === "") {
                token = undefined;
            }
        }
        this.state = {
            token: token
        };

        this.setToken = this.setToken.bind(this);
    }

    setToken(token) {
        this.setState({token: token});
    }

    render() {
        let content = "";
        if (this.state.token !== undefined) {
            content = <Lists token={this.state.token}/>;
        } else {
            content = <EmailLogin callback={this.setToken}/>;
        }
        return (
            <Container fluid>
                <Navbar bg="primary" variant="dark">
                    <Navbar.Brand>
                        <img src={logo} height="30" width="30" />
                        &nbsp; Author First Pass (no email authentication)
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
                        {content}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Main;