import React from 'react';
import {Card, Tab, Tabs} from "react-bootstrap";
import EntitiesListsComparisonTab from "./EntitiesListsComparisonTab";
import FlaggedDataTypesTab from "./FlaggedDataTypesTab";
import OtherYesNoDataTypesTab from "./OtherYesNoDataTypesTab";
import OtherDataTypesTab from "./OtherDataTypesTab";
import CommentsTab from "./CommentsTab";

const TabsArea = () => {
    return (
        <Card>
            <Card.Header>Data extracted by ACKnowledge and data submitted by author</Card.Header>
            <Card.Body>
                <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                    <Tab eventKey={1} title="Automatically extracted entities">
                        <EntitiesListsComparisonTab/>
                    </Tab>
                    <Tab eventKey={2} title="Automatically flagged (NN)">
                        <FlaggedDataTypesTab/>
                    </Tab>
                    <Tab eventKey={3} title="Author flagged">
                        <OtherYesNoDataTypesTab/>
                    </Tab>
                    <Tab eventKey={4} title="Author-provided entities">
                        <OtherDataTypesTab/>
                    </Tab>
                    <Tab eventKey={5} title="Comments">
                        <CommentsTab/>
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    );
}

export default TabsArea;
