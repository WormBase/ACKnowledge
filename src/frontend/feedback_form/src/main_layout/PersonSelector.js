import {Component} from "react";
import React from "react";
import {
    Alert,
    Button,
    FormControl,
    Glyphicon,
    Modal
} from "react-bootstrap";
import {getPerson} from "../redux/selectors/personSelectors";
import {connect} from "react-redux";
import {setPerson} from "../redux/actions/personActions";

class PersonSelector extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            person: props.person,
            show_fetch_data_error: false,
            show: false,
            sampleQuery: "Type your name",
            availableItems: new Set(),
            showMore: false
        };
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.person !== this.props.person) {
            this.setState({person: this.props.person});
        }
    }

    handleClose() {
        this.setState({
            show: false,
            show_fetch_data_error: false
        });
    }

    handleShow() {
        this.setState({ show: true });
    }

    searchWB(searchString, searchType) {
        if (searchString !== "") {
            fetch(process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '&objectType=' + searchType + '&userValue=' + searchString)
                .then(res => {
                    if (res.status === 200) {
                        return res.text();
                    } else {
                        this.setState({show_fetch_data_error: true})
                    }
                }).then(data => {
                if (data === undefined) {
                    this.setState({show_fetch_data_error: true})
                } else {
                    this.setAvailableItems(data, false);
                }
            }).catch(() => this.setState({show_fetch_data_error: true}));
        } else {
            this.setAvailableItems("");
        }
    }

    setAvailableItems(wbItems, removeAddInfo = false) {
        const addInfoRegex = / \( ([^ ]+) \)[ ]+$/;
        if (wbItems !== undefined && wbItems !== "\n") {
            let newAvailItems = new Set(wbItems.split("\n").filter((item) => item !== ''));
            if (removeAddInfo) {
                newAvailItems = new Set([...newAvailItems].map((elem) => elem.replace(addInfoRegex, "")));
            }
            if (newAvailItems.has("more ...")) {
                newAvailItems.delete("more ...");
                this.setState({
                    showMore: true
                });
            } else {
                this.setState({
                    showMore: false
                });
            }
            this.setState({
                availableItems: newAvailItems
            });
        } else {
            this.setState({
                availableItems: new Set(),
                showMore: false
            });
        }
    }

    render(){
        let data_fetch_err_alert = false;
        if (this.state.show_fetch_data_error) {
            data_fetch_err_alert = <Alert bsStyle="danger">
                <Glyphicon glyph="warning-sign"/> <strong>Error</strong><br/>
                Can't download WormBase data. Try again later or contact <a href="mailto:help@wormbase.org">
                Wormbase Helpdesk</a>.
            </Alert>;
        }
        let more = false;
        if (this.state.showMore) {
            more =
                <div className="row">
                    <div className="col-sm-12">
                        Some results matching the query have been omitted. Try a different query to narrow down the results.
                    </div>
                </div>
        }
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        WormBase User: <strong>{this.state.person.name}</strong> (WBPerson{this.state.person.personId})
                        &nbsp;&nbsp;<Button bsSize="xsmall" bsStyle="primary" onClick={this.handleShow}>Change user</Button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">

                    </div>
                </div>
                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select from Wormbase User list</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {data_fetch_err_alert}
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <input className="form-control"
                                           placeholder={this.state.sampleQuery}
                                           onChange={(e) => {this.searchWB(e.target.value, "person")}}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    &nbsp;
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl componentClass="select" multiple
                                                 style={{height: '200px'}}
                                                 defaultValue=""
                                                 onDoubleClick={(e) => {
                                                     let fullData = e.target.label;
                                                     let wbRx = / \( WBPerson([0-9]+) \)/;
                                                     let arr = wbRx.exec(fullData);
                                                     fullData = fullData.replace(wbRx, "");
                                                     this.props.setPerson(fullData, arr[1]);
                                                     this.handleClose();
                                                 }}>
                                        {[...this.state.availableItems].map(item =>
                                            <option>{item}</option>)}
                                    </FormControl>
                                </div>
                            </div>
                            {more}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    person: getPerson(state)
});

export default connect(mapStateToProps, {getPerson, setPerson})(PersonSelector);


