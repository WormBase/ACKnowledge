import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";

// Inject styles for centering modals vertically
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        .modal-dialog-centered {
            display: flex;
            align-items: center;
            min-height: calc(100vh - 60px);
        }
        .modal-dialog-centered .modal-content {
            margin: auto;
        }
    `;
    if (!document.querySelector('style[data-modal-center]')) {
        styleElement.setAttribute('data-modal-center', 'true');
        document.head.appendChild(styleElement);
    }
}

export const WelcomeModal = (props) => {
    if (props["show"] !== undefined && props["show"]) {
        return (
            <Modal
                {...props}
                bsSize="large"
                dialogClassName="modal-dialog-centered"
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
                    <Button bsStyle="primary" onClick={props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    } else {
        return ("");
    }
}

export const CompletedSubmissionModal = (props) => {
    if (props["show"] !== undefined && props["show"]) {
        return (
            <Modal
                {...props}
                bsSize="large"
                dialogClassName="modal-dialog-centered"
                aria-labelledby="contained-modal-title-sm">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Submission Already Completed</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        This form was already filled out and submitted by <strong>{props.previousAuthor}</strong>.
                    </p>
                    <p>
                        If you wish to review and/or modify the submission, click on the "Continue" button below.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={props.onHide}>Continue</Button>
                </Modal.Footer>
            </Modal>
        );
    } else {
        return ("");
    }
}

export const SectionsNotCompletedModal = (props) => {
    if (props.show) {
        return (
            <Modal
                {...props}
                bsSize="medium"
                dialogClassName="modal-dialog-centered">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Incomplete Sections</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You need to complete the following sections before ckicking the "finish and Submit" button:
                    <ul>
                        {[...props.sections].map(item => <li>{item}</li>)}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    } else {
        return ("");
    }
}
