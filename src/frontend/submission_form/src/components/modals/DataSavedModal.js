import React, {useEffect} from "react";
import {Button, Modal} from "react-bootstrap";
import {connect} from "react-redux";
import {hideDataSaved} from "../../redux/actions/displayActions";


const DataSavedModal = (props) => {
    
    useEffect(() => {
        let timeoutId;
        
        // Only set timeout for success messages that are not the final submission
        if (props.show && props.success && !props.last_widget) {
            timeoutId = setTimeout(() => {
                props.goToNextSection();
            }, 2000); // 2 seconds timeout
        }
        
        // Cleanup timeout if component unmounts or props change
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [props.show, props.success, props.last_widget, props.goToNextSection]);
    let btn = <Button bsStyle="danger" onClick={() => props.hideDataSaved()}>Close</Button>;
    let title = "Error!";
    let body = <div><span>Try again later or contact </span><a href="mailto:help@wormbase.org">Wormbase Helpdesk</a></div>;
    if (props.success) {
        if (props.last_widget) {
            btn = <Button bsStyle="success" onClick={() => props.hideDataSaved()}>Close</Button>;
            title =  "Congratulations!";
            body = "You have successfully submitted all your data to Wormbase. Thank you for your participation.";
        } else {
            btn = null; // No button for section saves
            title =  "Success!";
            body = "Data for this section have been successfully saved.";
        }
    }
    if (props.show) {
        return (
            <Modal show={props.show} onHide={() => props.hideDataSaved()}
                   bsSize="medium">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                {btn && (
                    <Modal.Footer>
                        {btn}
                    </Modal.Footer>
                )}
            </Modal>
        );
    } else {
        return ("");
    }
}

export default connect(null, {hideDataSaved})(DataSavedModal);