import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const ResetConfirmationModal = ({ show, onHide, onConfirm, itemsNamePlural, netAdditions, netRemovals }) => {
    const hasChanges = netAdditions > 0 || netRemovals > 0;
    
    return (
        <Modal show={show} onHide={onHide} size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Reset {itemsNamePlural}?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to reset the {itemsNamePlural} list to the last loaded state?</p>
                
                {hasChanges && (
                    <div style={{marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px'}}>
                        <strong>This will:</strong>
                        <ul style={{marginBottom: '0', marginTop: '4px', paddingLeft: '16px'}}>
                            {netAdditions > 0 && (
                                <li>Remove {netAdditions} added {netAdditions === 1 ? 'item' : 'items'}</li>
                            )}
                            {netRemovals > 0 && (
                                <li>Restore {netRemovals} removed {netRemovals === 1 ? 'item' : 'items'}</li>
                            )}
                        </ul>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="primary" onClick={onHide}>
                    Cancel
                </Button>
                <Button bsStyle="primary" onClick={onConfirm}>
                    Reset
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ResetConfirmationModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    itemsNamePlural: PropTypes.string.isRequired,
    netAdditions: PropTypes.number.isRequired,
    netRemovals: PropTypes.number.isRequired
};

export default ResetConfirmationModal;