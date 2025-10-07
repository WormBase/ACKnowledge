import React from "react";
import {Button, Modal} from "react-bootstrap";

/**
 * Modal to give users options when saving with multiple widgets having unsaved changes
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onHide - Callback when modal is closed without action
 * @param {function} onSaveCurrentOnly - Callback to save only the current widget
 * @param {function} onSaveAll - Callback to save all widgets with unsaved changes
 * @param {string} currentWidget - Name of the current widget
 * @param {array} otherWidgetsWithChanges - Array of widget names that have unsaved changes
 * @param {boolean} isGoToNext - Whether this is triggered from "Save and Go to Next Section" button
 */
const SaveOptionsModal = ({
    show,
    onHide,
    onSaveCurrentOnly,
    onSaveAll,
    currentWidget,
    otherWidgetsWithChanges = [],
    isGoToNext = false
}) => {
    const hasOtherChanges = otherWidgetsWithChanges.length > 0;

    return (
        <Modal show={show} onHide={onHide} bsSize="medium">
            <Modal.Header closeButton>
                <Modal.Title>Save Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {hasOtherChanges ? (
                    <>
                        <p>
                            You have unsaved changes in the following sections:
                        </p>
                        <ul>
                            {otherWidgetsWithChanges.map((widget, index) => (
                                <li key={index}><strong>{widget}</strong></li>
                            ))}
                        </ul>
                        <p>
                            Would you like to save only the <strong>{currentWidget}</strong> section,
                            or save all sections with unsaved changes?
                        </p>
                    </>
                ) : (
                    <p>
                        Do you want to save the <strong>{currentWidget}</strong> section
                        {isGoToNext ? ' and continue to the next section' : ''}?
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="secondary" onClick={onHide}>
                    Cancel
                </Button>
                {hasOtherChanges && (
                    <Button bsStyle="secondary" onClick={onSaveCurrentOnly}>
                        Save {currentWidget} Only{isGoToNext ? ' and Continue' : ''}
                    </Button>
                )}
                <Button bsStyle="primary" onClick={onSaveAll}>
                    {hasOtherChanges ? `Save All Sections${isGoToNext ? ' and Continue' : ''}` : `Save${isGoToNext ? ' and Continue' : ''}`}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SaveOptionsModal;
