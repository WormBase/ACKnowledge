import React from 'react';
import {
    Button, Col, Container,
    Form,
    FormControl, Nav, Navbar, NavDropdown, Row
} from "react-bootstrap";
import {Link, withRouter} from "react-router-dom";
import queryString from "query-string";
import StatusArea from "./paper_viewer_subpages/StatusArea";


class PaperViewer extends React.Component {
    constructor(props, context) {
        super(props, context);
        let paper_id = undefined;
        let url = document.location.toString();
        if (url.match("\\?")) {
            paper_id = queryString.parse(document.location.search).paper_id
        }
        this.state = {
            paper_id: undefined,
            paper_id_from_url: paper_id,
            paper_afp_processed: "NOT LOADED",
            paper_author_submitted: "NOT LOADED",
            paper_author_modified: "NOT LOADED",
            link_to_afp_form: "",
            load_diff: false,
            isLoading: false,
            api_called: false,
            paper_title: "",
            paper_journal: "",
            author_address: ""
        };
        this.setPaperId = this.setPaperId.bind(this);
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
        this.loadPaper = this.loadPaper.bind(this);
    }

    loadPaper() {
        this.setState({paper_id_from_url: this.state.paper_id, api_called: false, load_diff: false});
        this.componentDidUpdate();
    }

    loadDataFromAPI() {
        let payload = {
            paper_id: this.state.paper_id_from_url
        };
        if (payload.paper_id !== undefined && payload.paper_id !== "undefined") {
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
                    paper_title: data["title"],
                    paper_journal: data["journal"],
                    author_address: data["email"],
                    isLoading: false
                });
                if (data["author_submitted"] === true || data["author_modified"] === true) {
                    this.setState({load_diff: true});
                } else {
                    this.setState({load_diff: false});
                }
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
        if (this.state.paper_id_from_url !== undefined && this.state.paper_id_from_url !== "undefined" && !this.state.api_called) {
            this.loadDataFromAPI();
            this.setState({api_called: true})
        }
    }

    componentWillReceiveProps(nextProps){
        let url = document.location.toString();
        if (url.match("\\?")) {
            this.setState({
                paper_id_from_url: queryString.parse(document.location.search).paper_id,
                api_called: false
            });
        }
    }

    render() {
        return(
            <Container fluid>
                <Row>
                    <Col sm="12">
                        <Navbar bg="light" expand="lg">
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="mr-auto">
                                </Nav>
                                <Form inline onSubmit={e => e.preventDefault()}>
                                    <FormControl type="text" placeholder="Paper ID - 8 digits" className="mr-sm-2"
                                                 onChange={(e) => {this.setPaperId(e.target.value)}} onSubmit=""
                                                 onKeyPress={(target) => {if (target.key === 'Enter') {
                                                     this.props.history.push('?paper_id=' + this.state.paper_id);
                                                     this.loadPaper()}}}/>
                                    <Link to={
                                        {
                                            pathname: '/paper',
                                            search: '?paper_id=' + this.state.paper_id
                                        }
                                    }><Button variant="outline-primary">Load Paper</Button></Link>
                                </Form>
                            </Navbar.Collapse>
                        </Navbar>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        <StatusArea paper_id={this.state.paper_id_from_url} load_diff={this.state.load_diff}
                                    isLoading={this.state.isLoading} link_to_afp_form={this.state.link_to_afp_form}
                                    paper_afp_processed={this.state.paper_afp_processed}
                                    paper_author_submitted={this.state.paper_author_submitted}
                                    paper_author_modified={this.state.paper_author_modified}
                                    paper_title={this.state.paper_title}
                                    paper_journal={this.state.paper_journal}
                                    email={this.state.author_address} />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(PaperViewer);