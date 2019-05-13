import React from 'react';
import {Card, Tab, Tabs} from "react-bootstrap";
import EntitiesListsComparisonTab from "./EntitiesListsComparisonTab";
import FlaggedDataTypesTab from "./FlaggedDataTypesTab";
import OtherYesNoDataTypesTab from "./OtherYesNoDataTypesTab";
import OtherDataTypesTab from "./OtherDataTypesTab";
import CommentsTab from "./CommentsTab";

class TabsArea extends React.Component {

    render() {
        if (this.props.show === true) {
            return (
                <Card>
                    <Card.Header>Data extracted by AFP and data submitted by author</Card.Header>
                <Card.Body>
                    <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                        <Tab eventKey={1} title="Lists of entities">
                            <EntitiesListsComparisonTab/>
                        </Tab>
                        <Tab eventKey={2} title="Automatically flagged data types">
                            <FlaggedDataTypesTab/>
                        </Tab>
                        <Tab eventKey={3} title="Other yes/no data types">
                            <OtherYesNoDataTypesTab/>
                        </Tab>
                        <Tab eventKey={4} title="Other data types">
                            <OtherDataTypesTab/>
                        </Tab>
                        <Tab eventKey={5} title="Comments">
                            <CommentsTab/>
                        </Tab>
                    </Tabs>
                </Card.Body>
                </Card>
            )
        } else {
            return ("")
        }
    }
}

export default TabsArea;
