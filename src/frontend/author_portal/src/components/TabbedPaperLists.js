import React from "react";
import {Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import PaginatedPaperList from "./PaginatedPaperList";
import TabTitleWthNum from "./TabTitleWthNum";
import {listTypes} from "../redux/actions/lists";


const TabbedPaperLists = () => {
    return (
        <Container fluid>
            <Row>
                <Col sm="12">
                    &nbsp;
                </Col>
            </Row>
            <Row>
                <Col sm="12">
                    <p>
                        Below is a list of papers for which you are an author and that have been processed by the new WormBase ACKnowledge data flagging pipeline.
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
                        <Tab eventKey="1" title={<TabTitleWthNum listType={listTypes.WAITING}/>}>
                            <br/>
                            <PaginatedPaperList listType={listTypes.WAITING}/>
                        </Tab>
                        <Tab eventKey="3" title={<TabTitleWthNum listType={listTypes.PARTIAL}/>}>
                            <br/>
                            <PaginatedPaperList listType={listTypes.PARTIAL}/>
                        </Tab>
                        <Tab eventKey="2" title={<TabTitleWthNum listType={listTypes.SUBMITTED}/>}>
                            <br/>
                            <PaginatedPaperList listType={listTypes.SUBMITTED}/>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    )
}

export default TabbedPaperLists;