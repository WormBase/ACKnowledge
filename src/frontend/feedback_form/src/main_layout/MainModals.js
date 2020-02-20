import React from "react";
import {Button, Modal} from "react-bootstrap";

export class WelcomeModal extends React.Component {
    constructor(props, context) {
        super(props, context);
        let show = "";
        if (props["show"] !== undefined) {
            show = props["show"];
        }
        this.state = {show: show};
    }
    render() {
        if (this.state.show) {
            return (
                <Modal
                    {...this.props}
                    bsSize="large"
                    aria-labelledby="contained-modal-title-sm">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">Welcome</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Thank you for filling out this form. By doing so, you are helping us incorporate your data into WormBase in a timely fashion.
                        </p>
                        <p>
                            Please review the information presented in each page of the form. If needed, you may revise what is there or add more information.
                        </p>
                        <p>
                            To save the data entered in each page and move to the next, click 'Save and continue'. You can return to each page any time. When you are finished, please click on 'Finish and Submit' on the last page.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>Close</Button>
                    </Modal.Footer>
                </Modal>
            );
        } else {
            return ("");
        }
    }
}

export class SectionsNotCompletedModal extends React.Component {
    render() {
        if (this.props.show) {
            return (
                <Modal
                    {...this.props}
                    bsSize="medium">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">Incomplete Sections</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        You need to complete the following sections before ckicking the "finish and Submit" button:
                        <ul>
                            {[...this.props.sections].map(item => <li>{item}</li>)}
                        </ul>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="danger" onClick={this.props.onHide}>Close</Button>
                    </Modal.Footer>
                </Modal>
            );
        } else {
            return ("");
        }
    }
}
