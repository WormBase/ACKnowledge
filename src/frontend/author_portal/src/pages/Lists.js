import React, {useEffect} from 'react';
import {Col, Container, Row, Spinner, Tab, Tabs} from "react-bootstrap";
import Message from "../components/Message";
import PaginatedSearchList from "../components/PaginatedSearchList";
import Badge from "react-bootstrap/Badge";
import {useDispatch, useSelector} from "react-redux";
import {listTypes, validateTokenAndGetCounts} from "../redux/actions/lists";

const Lists = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.login.token);
    const numWaiting = useSelector((state) => state.lists.listCounters[listTypes.WAITING]);
    const numPartial = useSelector((state) => state.lists.listCounters[listTypes.PARTIAL]);
    const numSubmitted = useSelector((state) => state.lists.listCounters[listTypes.SUBMITTED]);
    const tokenIsValid = useSelector((state) => state.lists.tokenIsValid);
    const isLoading = useSelector((state) => state.lists.isLoading);
    const error = useSelector((state) => state.lists.error);

    useEffect(() => {
        dispatch(validateTokenAndGetCounts(token));
    }, []);

    return(
        <div>
            {isLoading ? <Spinner animation="banner"/> : null}
            {error ? <Message title="Error" subtitle="The provided token is not valid or expired" /> : null}
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
                                <Tab eventKey="1" title={<span>Papers waiting for data submission <Badge variant="danger">{numWaiting}</Badge></span>}>
                                    <PaginatedSearchList endpoint="get_processed_papers" papersPerPage="10"
                                                         passwd={token}/>
                                </Tab>
                                <Tab eventKey="3" title={<span>Partial data submission <Badge variant="warning">{numPartial}</Badge></span>}>
                                    <PaginatedSearchList endpoint="get_partial_papers" papersPerPage="10"
                                                         passwd={token}/>
                                </Tab>
                                <Tab eventKey="2" title={<span>Data submission completed <Badge variant="success">{numSubmitted}</Badge></span>}>
                                    <PaginatedSearchList endpoint="get_submitted_papers" papersPerPage="10"
                                                         passwd={token}/>
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
                </Container>
                : null}
        </div>
    );
}

export default Lists;