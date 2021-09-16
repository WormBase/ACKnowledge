import React from 'react';
import {IndexLinkContainer} from "react-router-bootstrap";
import {withRouter} from "react-router-dom";
import {Col, Container, Form, Row} from "react-bootstrap";

class LateralMenu extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: undefined
        };
    }

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
                        <IndexLinkContainer to={"home" + args}
                                            active={true}>
                            <a className="aw">
                                <h5>Author First Pass</h5>
                                <h6>Admin Dashboard</h6>
                            </a>
                        </IndexLinkContainer>
                    </Col>
                </Row>

                <Row>
                    <Col sm="10">
                        <hr/>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Load a Paper:</Form.Label>&nbsp;
                            <Form inline onSubmit={e => e.preventDefault()} ref={(el) => this.searchForm = el}>
                                <Form.Control type="text" placeholder="Paper ID - 8 digits" size="sm"
                                              autoComplete="off" style={{ width: '100%' }}
                                              onChange={(e) => {this.setState({paper_id: e.target.value})}} onSubmit=""
                                              onKeyPress={(target) => {if (target.key === 'Enter') {
                                                  this.props.history.push("/paper?paper_id=" + this.state.paper_id);
                                                  this.searchForm.reset();
                                              }}}/>
                            </Form>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <hr/>
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
                <Row>
                    <Col sm="10">
                        <IndexLinkContainer to={"contributors" + args}
                                            active={true}>
                            <a className="aw"><h6>Contributors</h6></a>
                        </IndexLinkContainer>
                    </Col>
                </Row>
                <Row>
                    <Col sm="10">
                        <IndexLinkContainer to={"entities" + args}
                                            active={true}>
                            <a className="aw"><h6>Entities Added/Removed</h6></a>
                        </IndexLinkContainer>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(LateralMenu);