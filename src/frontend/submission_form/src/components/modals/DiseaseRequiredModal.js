import React from 'react';
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

const DiseaseRequiredModal = ({show, close}) => {
    return (
        <Modal show={show} onHide={close}>
            <Modal.Header closeButton>
                <Modal.Title>Disease information required</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please specify at least one disease name since you indicated this paper describes a human disease model.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={close}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DiseaseRequiredModal;