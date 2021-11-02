import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";


const NumElemPerPageSelector = ({setNumElemPerPageCallback}) => {
    const [countValidationState, setCountValidationState] = useState(null);
    const [elemPerPage, setElemPerPage] = useState(10);
    return (
        <Container fluid>
            <Row>
                <Col sm="12">
                    <Form onSubmit={e => e.preventDefault()} inline>
                        <FormGroup controlId="formValidationError2"
                                   validationState={countValidationState}>
                            <Form.Label>Elements per page: &nbsp;</Form.Label>
                            <FormControl
                                type="text" autoComplete="off" maxLength="3" size="sm"
                                placeholder={elemPerPage}
                                onInput={(event) => {
                                    if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) &&
                                        isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
                                        setElemPerPage(parseInt(event.target.value));
                                        setCountValidationState(null);
                                    } else if (event.target.value !== "") {
                                        setCountValidationState("error");
                                    } else {
                                        setCountValidationState(null);
                                    }
                                }}
                                onKeyPress={(target) => {
                                    if (target.key === 'Enter' && elemPerPage > 0) {
                                        setNumElemPerPageCallback(elemPerPage);
                                    }
                                }}
                            />
                            <Button variant="outline-primary" size="sm" onClick={() => {
                                if (elemPerPage > 0) {
                                    setNumElemPerPageCallback(elemPerPage);
                                }
                            }}>Refresh</Button>
                        </FormGroup>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default NumElemPerPageSelector;
