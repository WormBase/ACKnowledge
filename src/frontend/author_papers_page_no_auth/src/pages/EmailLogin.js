import React from 'react';
import {Alert, Button, Card, Col, Container, Form, FormControl, FormLabel, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faAddressCard } from '@fortawesome/free-regular-svg-icons'

class EmailLogin extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            email_address: undefined,
            showError: false
        };

        this.getToken = this.getToken.bind(this);
    }

    getToken() {
        let payload = { email: this.state.email_address };
        if (payload.email !== undefined && payload.email !== "undefined") {
            this.setState({isLoading: true});
            fetch(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/get_token_from_email", {
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
                    this.setState({showError: true});
                }
            }).then(data => {
                if (data === undefined) {
                } else {
                    this.props.callback(data["token"]);
                }
            }).catch((err) => {
                alert(err);
            });
        }
    }

    render() {
        let error_message = "";
        if (this.state.showError) {
            error_message = <Alert variant="danger">Email not found in the AFP system</Alert>;
        }
        return(
            <Container fluid>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="2">
                        &nbsp;
                    </Col>
                    <Col sm="8">
                        <Card>
                            <Card.Header>
                                <h2 className="text-center">Request access to your AFP page</h2>
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    <h1 className="text-center"><FontAwesomeIcon icon={faAddressCard}/></h1>
                                    If you are a corresponding author and your email address is listed on WormBase, you
                                    can access the list of your papers processed by the Author First Pass by providing
                                    the email address at which you received AFP contact emails. <br/><br/>
                                    <Form onSubmit={e => e.preventDefault()}>
                                        <FormLabel>Email address</FormLabel>
                                        <FormControl type="text" placeholder="Enter your email address" style={{ width: '100%' }}
                                                     onChange={(e) => {this.setState({email_address: e.target.value})}} onSubmit=""
                                                     onKeyPress={(target) => {if (target.key === 'Enter') { this.getToken() }}}/>
                                        {error_message}<br/>
                                        <Button onClick={() => { this.getToken() }}>Request Access</Button>
                                    </Form>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="2">
                        &nbsp;
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default EmailLogin;