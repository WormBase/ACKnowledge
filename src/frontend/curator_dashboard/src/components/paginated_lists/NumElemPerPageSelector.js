import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";


class NumElemPerPageSelector extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            countValidationState: null,
            elemPerPage: props.elemPerPage,
        }
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col sm="12">
                        <Form onSubmit={e => e.preventDefault()} inline>
                            <FormGroup controlId="formValidationError2"
                                       validationState={this.state.countValidationState}>
                                <Form.Label>Elements per page: &nbsp;</Form.Label>
                                <FormControl
                                    type="text" autoComplete="off" maxLength="3" size="sm"
                                    placeholder={this.state.elemPerPage}
                                    onInput={(event) => {
                                        if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) &&
                                            isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
                                            this.setState({
                                                elemPerPage: event.target.value,
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
                                    onKeyPress={(target) => {
                                        if (target.key === 'Enter' &&
                                            this.state.elemPerPage > 0) {
                                            this.props.setNumElemPerPageCallback(this.state.elemPerPage);
                                        }
                                    }}
                                />
                                <Button variant="outline-primary" size="sm" onClick={() => {
                                    if (
                                        this.state.elemPerPage > 0) {
                                        this.props.setNumElemPerPageCallback(this.state.elemPerPage);
                                    }
                                }}>Refresh</Button>
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default NumElemPerPageSelector;