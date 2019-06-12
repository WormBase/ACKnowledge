import React from 'react';
import {Col, Container, Row, Tab, Tabs} from "react-bootstrap";
import Message from "../components/Message";
import PaginatedSearchList from "../components/PaginatedSearchList";

class Lists extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            token_valid: undefined
        };

        this.getPapersFromToken = this.getPapersFromToken.bind(this);
    }

    componentDidMount() {
        this.getPapersFromToken();
    }

    getPapersFromToken() {
        let payload = { passwd: this.props.token };
        if (payload.passwd !== undefined && payload.passwd !== "undefined") {
            this.setState({isLoading: true});
            fetch(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/is_token_valid", {
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
                } else {
                    if (data["token_valid"] === "True") {
                        this.setState({token_valid: true})
                    } else {
                        this.setState({token_valid: false})
                    }
                }
            }).catch((err) => {
                alert(err);
            });
        }
    }

    render() {
        let content = "";
        if (this.state.token_valid) {
            content =
                <Container fluid>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <h2 className="text-center">Your AFP papers</h2>
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
                                <Tab eventKey="1" title="Papers waiting for data submission">
                                    <PaginatedSearchList endpoint="get_processed_papers" papersPerPage="10"
                                                         passwd={this.props.token}/>
                                </Tab>
                                <Tab eventKey="2" title="Data submission completed">
                                    <PaginatedSearchList endpoint="get_submitted_papers" papersPerPage="10"
                                                         passwd={this.props.token}/>
                                </Tab>
                                <Tab eventKey="3" title="Partial data submission">
                                    <PaginatedSearchList endpoint="get_partial_papers" papersPerPage="10"
                                                         passwd={this.props.token}/>
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
            </Container>;
        } else if  (this.state.token_valid === undefined) {
            content = <Message subtitle="Loading data ..." />
        } else {
            content = <Message title="Error" subtitle="The provided token is not valid or expired" />
        }
        return(
            <div> {content} </div>
        );
    }
}

export default Lists;