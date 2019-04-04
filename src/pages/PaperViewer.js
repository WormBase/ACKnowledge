import React from 'react';
import {
    Button,
    Form,
    FormControl,
    Tab,
    Tabs
} from "react-bootstrap";
import EntityDiffRow from "../page_components/EntityDiffRow";
import EntitiesListsComparison from "./EntitiesListsComparison";
import FlaggedDataTypes from "./FlaggedDataTypes";

class PaperViewer extends React.Component {

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        &nbsp;
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 text-right">
                        <Form inline>
                            <FormControl type="text" placeholder="Paper ID" />
                            <Button type="submit">Load Paper</Button>
                        </Form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                            <Tab eventKey={1} title="Lists of entities">
                                <EntitiesListsComparison/>
                            </Tab>
                            <Tab eventKey={2} title="Automatically flagged data types">
                                <FlaggedDataTypes/>
                            </Tab>
                            <Tab eventKey={3} title="Other yes/no data types">
                                <FlaggedDataTypes/>
                            </Tab>
                            <Tab eventKey={4} title="Other data types">

                            </Tab>
                            <Tab eventKey={5} title="Comments">

                            </Tab>
                        </Tabs>
                    </div>
                </div>

            </div>
        );
    }
}

export default PaperViewer;