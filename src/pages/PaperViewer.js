import React from 'react';
import {
    Button,
    Form,
    FormControl} from "react-bootstrap";
import {Link, withRouter} from "react-router-dom";
import queryString from "query-string";
import StatusArea from "./paper_viewer_subpages/StatusArea";


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
            load_diff: false,
            isLoading: true,
            api_called: false
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
                if (data["author_submitted"] === true || data["author_modified"] === true) {
                    this.setState({load_diff: true});
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
        if (this.state.paper_id_from_url !== undefined && !this.state.api_called) {
            this.loadDataFromAPI();
            this.setState({api_called: true})
        }
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
                                         onChange={(e) => {this.setPaperId(e.target.value)}} onSubmit=""
                                         onKeyPress={(target) => {if (target.key === 'Enter') {
                                             this.props.history.push('?paper_id=' + this.state.paper_id);
                                             this.loadPaper()}}}/>
                            <Link to={
                                {
                                    pathname: '/paper',
                                    search: '?paper_id=' + this.state.paper_id
                                }
                            }><Button onClick={this.loadPaper}>
                                Load Paper
                            </Button></Link>
                        </Form>
                    </div>
                </div>
                <StatusArea paper_id={this.state.paper_id_from_url} load_diff={this.state.load_diff}
                            isLoading={this.state.isLoading} link_to_afp_form={this.state.link_to_afp_form}
                            paper_afp_processed={this.state.paper_afp_processed}
                            paper_author_submitted={this.state.paper_author_submitted}
                            paper_author_modified={this.state.paper_author_modified}
                />
            </div>
        );
    }
}

export default withRouter(PaperViewer);