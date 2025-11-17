import React from "react";
import {Button, Modal} from "react-bootstrap";

/**
 * Modal to warn users about unsaved changes when trying to navigate away
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onHide - Callback when modal is closed without action
 * @param {function} onSaveAndContinue - Callback to save current widget and continue navigation
 * @param {function} onContinueWithoutSaving - Callback to continue navigation without saving
 * @param {string} currentWidget - Name of the current widget with unsaved changes
 * @param {string} targetWidget - Name of the widget user is trying to navigate to
 */
const UnsavedChangesModal = ({
    show,
    onHide,
    onSaveAndContinue,
    currentWidget,
    targetWidget
}) => {
    return (
        <Modal show={show} onHide={onHide} bsSize="medium">
            <Modal.Header closeButton>
                <Modal.Title>Unsaved Changes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    You have unsaved changes in the <strong>{currentWidget}</strong> section.
                </p>
                <p>
                    Would you like to save your changes before navigating to <strong>{targetWidget}</strong>?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button bsStyle="primary" onClick={onSaveAndContinue}>
                    Save and Continue
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UnsavedChangesModal;
