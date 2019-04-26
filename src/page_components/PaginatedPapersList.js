import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {
    Badge, Button,
    ControlLabel,
    Form,
    FormControl,
    FormControlFeedback,
    FormGroup,
    ListGroup,
    ListGroupItem,
    Pagination
} from "react-bootstrap";
import {Link} from "react-router-dom";

class PaginatedPapersList extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            list_papers: [],
            num_papers: 0,
            from_offset: 0,
            count: 20,
            active_page: 1,
            cx: 0,
            isLoading: false,
            refresh_list: false,
            countValidationState: null,
            tmp_count: 0
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    componentDidMount() {
        this.loadDataFromAPI();
    }

    componentDidUpdate() {
        if (this.state.refresh_list === true) {
            this.loadDataFromAPI();
            this.setState({refresh_list: false});
        }
    }

    loadDataFromAPI() {
        this.setState({isLoading: true});
        let payload = {
            from: this.state.from_offset,
            count: this.state.count,
            list_type: this.props.listType
        };
        fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers", {
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
                alert("Error")
            }
        }).then(data => {
            if (data === undefined) {
                alert("Empty response")
            }
            this.setState({
                list_papers: data["list_ids"],
                num_papers: data["total_num_ids"],
                isLoading: false
            });
        }).catch((err) => {
            alert(err);
        });
    }

    render() {

        let items = [];
        for (let number = 1; number <= Math.ceil(this.state.num_papers / this.state.count); number++) {
            items.push(
                <Pagination.Item key={number} active={number === this.state.active_page}
                                 onClick={() => {
                                     this.setState({
                                         active_page: number,
                                         from_offset: (number - 1) * this.state.count,
                                         refresh_list: true
                                     });
                                 }}>
                    {number}
                </Pagination.Item>,
            );
        }

        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        &nbsp;
                    </div>
                </div>
                <LoadingOverlay
                    active={this.state.isLoading}
                    spinner
                    text='Loading paper data...'
                    styles={{
                        overlay: (base) => ({
                            ...base,
                            background: 'rgba(65,105,225,0.5)'
                        })
                    }}
                >
                    <div className="row">
                        <div className="col-sm-2">
                            <ControlLabel>Number of papers:</ControlLabel> <Badge>{this.state.num_papers}</Badge>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <Pagination>
                                <Pagination.First onClick={() => {this.setState({
                                    active_page: 1,
                                    from_offset: 0,
                                    refresh_list: true})}} />
                                <Pagination.Prev onClick={() => {
                                    if (this.state.active_page > 1) {
                                        this.setState({
                                            active_page: this.state.active_page - 1,
                                            from_offset: this.state.from_offset - this.state.count,
                                            refresh_list: true})
                                    }}} />
                                {items}
                                <Pagination.Next onClick={() => {
                                    if (this.state.active_page <  Math.ceil(this.state.num_papers / this.state.count)) {
                                        this.setState({
                                            active_page: this.state.active_page + 1,
                                            from_offset: this.state.from_offset + this.state.count,
                                            refresh_list: true})
                                }}} />
                                <Pagination.Last onClick={() => {this.setState({
                                    active_page: Math.ceil(this.state.num_papers / this.state.count),
                                    from_offset: (Math.ceil(this.state.num_papers / this.state.count) - 1) * this.state.count,
                                    refresh_list: true})}} />
                            </Pagination>
                            <ListGroup>
                                {[...this.state.list_papers].sort().map(item =>
                                    <ListGroupItem>
                                        <Link to={{pathname: '/paper', search: '?paper_id=' + item}}>{item}</Link>
                                    </ListGroupItem>)}
                            </ListGroup>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <Form onSubmit={e => e.preventDefault()} inline>
                                <FormGroup controlId="formValidationError2"
                                           validationState={this.state.countValidationState}>
                                    <ControlLabel>Papers per page: &nbsp;</ControlLabel>
                                    <FormControl
                                        type="text" autoComplete="off" maxLength="3" bsSize="small"
                                        placeholder={this.state.count}
                                        onInput={(event) => {
                                            if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) && isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
                                                this.setState({
                                                    tmp_count: event.target.value,
                                                    countValidationState: null
                                                })
                                            } else if (event.target.value !== "") {
                                                this.setState({
                                                    countValidationState: "error"
                                                })
                                            } else {
                                                this.setState({
                                                    countValidationState: null
                                                })
                                            }
                                        }}
                                        onKeyPress={(target) => {if (target.key === 'Enter' && this.state.tmp_count > 0) {
                                            this.setState({
                                                count: this.state.tmp_count,
                                                from_offset: 0,
                                                active_page: 1,
                                                refresh_list: true
                                            })
                                        }}}
                                    />
                                    <Button bsStyle="primary" bsSize="small" onClick={() => { if (this.state.tmp_count > 0)
                                        this.setState({
                                            count: this.state.tmp_count,
                                            from_offset: 0,
                                            active_page: 1,
                                            refresh_list: true
                                        })}}>Refresh</Button>
                                </FormGroup>
                            </Form>
                        </div>
                    </div>
                </LoadingOverlay>
            </div>
        );
    }
}

export default PaginatedPapersList;