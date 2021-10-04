import React, {useState} from 'react';
import {Alert, Button, Card, Col, Container, Form, FormControl, FormLabel, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faAddressCard } from '@fortawesome/free-regular-svg-icons'

const EmailLogin = () => {
    const [emailAddress, setEmailAddress] = useState(undefined);
    const [showError, setShowError] = useState(undefined);


    let error_message = "";
    if (this.state.showError) {
        error_message = <Alert variant="danger">Email not found in the AFP system</Alert>;
    } else if (this.state.showSuccess) {
        error_message = <Alert variant="success">Email sent</Alert>;
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

                                The WormBase Author First Pass pipeline is a way for WormBase to identify entities
                                (e.g. genes) and data types (e.g. genetic interactions) found in newly published
                                papers. The pipeline uses the Textpresso Central text mining system and approved
                                C. elegans nomenclature to flag papers for curation by WormBase curators.
                                Verification of flagged data by authors helps prioritize papers for curation and
                                provides feedback to improve the system. <br/><br/>

                                <Form onSubmit={e => e.preventDefault()}>
                                    <FormLabel>Email address</FormLabel>
                                    <FormControl type="text" placeholder="Enter your email address" style={{ width: '100%' }}
                                                 onChange={(e) => {this.setState({email_address: e.target.value})}} onSubmit=""
                                                 onKeyPress={(target) => {if (target.key === 'Enter') {this.logIn()}}}/>
                                    {error_message}<br/>
                                    <Button onClick={() => { this.logIn() }}>Request Access</Button>
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

export default EmailLogin;