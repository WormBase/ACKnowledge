import React, {useState} from 'react';
import {IndexLinkContainer} from "react-router-bootstrap";
import {withRouter} from "react-router-dom";
import {Col, Container, Form, Image, Row} from "react-bootstrap";
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "../redux/actions";
import {useHistory} from "react-router";

const LateralMenu = ({onMenuItemClick = () => {}}) => {
    const dispatch = useDispatch();
    const [tmpPaperID, setTmpPaperID] = useState('');
    const history = useHistory();
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
                <Col sm="10" align="center">
                    <IndexLinkContainer to={"home" + args}
                                        active={true}>
                        <a className="aw">
                            <Image src="Combination-Mark-RGB-White.svg"/>
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
                        <Form inline onSubmit={e => e.preventDefault()}>
                            <Form.Control type="text" placeholder="Paper ID - 8 digits" size="sm"
                                          autoComplete="off" style={{ width: '100%' }}
                                          value={tmpPaperID}
                                          onChange={(e) => setTmpPaperID(e.target.value)} onSubmit=""
                                          onKeyPress={(target) => {if (target.key === 'Enter') {
                                              if (tmpPaperID !== '') {
                                                  dispatch(setSelectedPaperID(tmpPaperID));
                                                  setTmpPaperID('');
                                                  history.push("/paper?paper_id=" + tmpPaperID);
                                              }
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
                        <a className="aw" onClick={onMenuItemClick}><h6>Paper Status</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"stats" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Overall Stats</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"papers_stats" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Extraction stats</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"lists" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Paper Lists</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"contributors" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Contributors</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"entities" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Entities Added/Removed</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"sentence_classification" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Sentence Level Classification</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
        </Container>
    );
}

export default withRouter(LateralMenu);