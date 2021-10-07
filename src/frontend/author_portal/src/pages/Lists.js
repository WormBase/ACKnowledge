import React, {useEffect} from 'react';
import {Alert, Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import {useDispatch, useSelector} from "react-redux";
import {listTypes, validateToken} from "../redux/actions/lists";
import PaginatedPaperList from "../components/PaginatedPaperList";

const Lists = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.login.token);
    const tokenIsValid = useSelector((state) => state.lists.tokenIsValid);
    const tokenIsValidating = useSelector((state) => state.lists.tokenIsValidating);
    const error = useSelector((state) => state.lists.error);
    const paperLists = useSelector((state) => state.lists.paperLists);

    useEffect(() => {
        dispatch(validateToken(token));
    }, []);

    return(
        <div>
            {tokenIsValidating ? <Alert variant="info">Validating token...</Alert> : null}
            {error ? <Alert variant="danger">Error: An error occurred</Alert> : null}
            {tokenIsValid ?
                <Container fluid>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <p>
                                Below is a list of papers for which you are an author and that have been processed by the new WormBase Author First Pass data flagging pipeline.
                            </p>
                            <p>To verify the flagged data, please click on the link to your paper.</p>
                            <p>Thank you for helping WormBase curate your paper!</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <Tabs defaultActiveKey="1" id="uncontrolled-tab-example">
                                <Tab eventKey="1" title={<span>Papers waiting for data submission <Badge variant="danger">{paperLists[listTypes.WAITING].totNumElements}</Badge></span>}>
                                    <br/>
                                    <PaginatedPaperList listType={listTypes.WAITING}/>
                                </Tab>
                                <Tab eventKey="3" title={<span>Partial data submission <Badge variant="warning">{paperLists[listTypes.PARTIAL].totNumElements}</Badge></span>}>
                                    <br/>
                                    <PaginatedPaperList listType={listTypes.PARTIAL} />
                                </Tab>
                                <Tab eventKey="2" title={<span>Data submission completed <Badge variant="success">{paperLists[listTypes.SUBMITTED].totNumElements}</Badge></span>}>
                                    <br/>
                                    <PaginatedPaperList listType={listTypes.SUBMITTED} />
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
                </Container>
                : tokenIsValid === false ?
                    <Alert variant="danger">Error: The provided token is not valid or expired</Alert> : null
            }
        </div>
    );
}

export default Lists;