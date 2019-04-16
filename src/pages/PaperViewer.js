import React from 'react';
import {
    Alert, Badge,
    Button,
    Form,
    FormControl, Jumbotron, Panel,
    Tab,
    Tabs
} from "react-bootstrap";
import EntitiesListsComparison from "./paper_viewer_subpages/EntitiesListsComparison";
import FlaggedDataTypes from "./paper_viewer_subpages/FlaggedDataTypes";
import {Link, withRouter} from "react-router-dom";
import queryString from "query-string";
import LoadingOverlay from 'react-loading-overlay';
import OtherYesNoDataTypes from "./paper_viewer_subpages/OtherYesNoDataTypes";
import OtherDataTypes from "./paper_viewer_subpages/OtherDataTypes";
import Comments from "./paper_viewer_subpages/Comments";


class PaperViewer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: undefined,
            paper_id_from_url: queryString.parse(this.props.location.search).paper_id,
            paper_afp_processed: "NOT LOADED",
            paper_author_submitted: "NOT LOADED",
            paper_author_modified: "NOT LOADED",
            link_to_afp_form: "",
            isLoading: true,
            api_called: false
        };
        this.setPaperId = this.setPaperId.bind(this);
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    loadDataFromAPI() {
        let payload = {
            paper_id: this.state.paper_id_from_url
        };
        if (payload.paper_id !== undefined) {
            this.setState({isLoading: true});
            fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/status", {
                method: 'POST',
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                }
            }).then(data => {
                if (data === undefined) {
                }
                this.setState({
                    paper_afp_processed: data["afp_processed"] ? "TRUE" : "FALSE",
                    paper_author_submitted: data["author_submitted"] ? "TRUE" : "FALSE",
                    paper_author_modified: data["author_modified"] ? "TRUE" : "FALSE",
                    link_to_afp_form: data["afp_form_link"],
                    isLoading: false
                });
            }).catch((err) => {
                alert(err);
            });
        }
    }


    setPaperId(paperId) {
        this.setState({paper_id: paperId});
    }

    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        if (this.state.paper_id_from_url !== undefined && !this.state.api_called) {
            this.loadDataFromAPI();
            this.setState({api_called: true})
        }
    }

    render() {

        let paper_area = "";
        if (this.state.paper_id_from_url !== undefined) {
            paper_area =
                <div>
                    <LoadingOverlay
                        active={this.state.isLoading}
                        spinner
                        text='Loading status info...'
                        styles={{
                            overlay: (base) => ({
                                ...base,
                                background: 'rgba(65,105,225,0.5)'
                            })
                        }}
                    >
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <Panel>
                                    <Panel.Heading>Link to AFP submission form</Panel.Heading>
                                    <Panel.Body><a href={this.state.link_to_afp_form} target="_blank">{this.state.link_to_afp_form}</a></Panel.Body>
                                </Panel>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <Panel>
                                    <Panel.Heading>Paper Status</Panel.Heading>
                                    <Panel.Body>Processed by AFP: &nbsp; <Badge>{this.state.paper_afp_processed}</Badge><br/>
                                        Data submitted by author: &nbsp; <Badge>{this.state.paper_author_submitted}</Badge><br/>
                                        Author has modified any data: &nbsp; <Badge>{this.state.paper_author_modified}</Badge>
                                    </Panel.Body>
                                </Panel>
                            </div>
                        </div>
                    </LoadingOverlay>
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
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
                                    <OtherYesNoDataTypes/>
                                </Tab>
                                <Tab eventKey={4} title="Other data types">
                                    <OtherDataTypes/>
                                </Tab>
                                <Tab eventKey={5} title="Comments">
                                    <Comments/>
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </div>
        } else {
            paper_area =
                <div>
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-2">
                            &nbsp;
                        </div>
                        <div className="col-sm-8">
                             <Jumbotron>
                                 <h3>Paper not loaded</h3>
                                 <p>
                                     Enter the 8 digit ID of a paper to see its AFP curation status.
                                 </p>
                             </Jumbotron>
                        </div>
                        <div className="col-sm-2">
                            &nbsp;
                        </div>
                    </div>
                </div>
        }

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
                            }><Button onClick={() => {
                                this.setState({paper_id_from_url: this.state.paper_id});

                            }}>Load Paper</Button></Link>
                        </Form>
                    </div>
                </div>
                {paper_area}
            </div>
        );
    }
}

export default withRouter(PaperViewer);