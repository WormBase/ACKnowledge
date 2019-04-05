import React from 'react';
import {
    Button,
    Form,
    FormControl,
    Tab,
    Tabs
} from "react-bootstrap";
import EntitiesListsComparison from "./EntitiesListsComparison";
import FlaggedDataTypes from "./FlaggedDataTypes";
import {Link, withRouter} from "react-router-dom";


class PaperViewer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: undefined
        };
        this.setPaperId = this.setPaperId.bind(this);
    }

    setPaperId(paperId) {
        this.setState({paper_id: paperId});
    }


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
                        <Form inline onSubmit={e => e.preventDefault()}>
                            <FormControl type="text" placeholder="Paper ID - 8 digits"
                                         onChange={(e) => {this.setPaperId(e.target.value)}} onSubmit=""/>
                            <Link to={
                                {
                                    pathname: '/paper',
                                    search: '?paper_id=' + this.state.paper_id
                                }
                            }><Button>Load Paper</Button></Link>
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

export default withRouter(PaperViewer);