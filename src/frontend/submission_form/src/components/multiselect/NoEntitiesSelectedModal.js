import React from 'react';
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

const NoEntitiesSelectedModal = ({show, close}) => {
    return (
        <Modal show={show} onHide={close}>
            <Modal.Header closeButton>
                <Modal.Title>No entities selected</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please select one or more entities.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={close}>Close</Button>
            </Modal.Footer>
        </Modal>)
}

export default NoEntitiesSelectedModal;
