import React from 'react';
import {IndexLinkContainer} from "react-router-bootstrap";
import {withRouter} from "react-router-dom";
import {Col, Container, Row} from "react-bootstrap";

class LateralMenu extends React.Component {
    render() {
        let url = document.location.toString();
        let args = "";
        if (url.match('\\?')) {
            args = "?" + url.split('?')[1]
        }

        return(
            <Container fluid>
                <Row>
                    <Col sm="10">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <h5>Author First Pass</h5>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <h6>Admin Dashboard</h6>
                    </Col>
                </Row>

                <Row>
                    <Col sm="10">
                        <hr/>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <IndexLinkContainer to={"home" + args}
                                            active={true}>
                            <a className="aw"><h6>Home</h6></a>
                        </IndexLinkContainer>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <IndexLinkContainer to={"paper" + args}
                                            active={true}>
                            <a className="aw"><h6>Paper Status</h6></a>
                        </IndexLinkContainer>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <IndexLinkContainer to={"stats" + args}
                                            active={true}>
                            <a className="aw"><h6>Overall Stats</h6></a>
                        </IndexLinkContainer>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <IndexLinkContainer to={"lists" + args}
                                            active={true}>
                            <a className="aw"><h6>Paper Lists</h6></a>
                        </IndexLinkContainer>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(LateralMenu);