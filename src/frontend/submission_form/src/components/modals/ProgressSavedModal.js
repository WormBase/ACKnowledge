import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { hideProgressSaved } from '../../redux/actions/displayActions';

const ProgressSavedModal = ({ show }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                dispatch(hideProgressSaved());
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, dispatch]);

    return (
        <Modal show={show} backdrop="static" keyboard={false}>
            <Modal.Header>
                <Modal.Title>
                    Progress Saved
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Your progress has been saved successfully.
            </Modal.Body>
        </Modal>
    );
};

export default ProgressSavedModal;