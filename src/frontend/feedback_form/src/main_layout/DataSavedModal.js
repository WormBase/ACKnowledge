import React from "react";
import {Button, Modal} from "react-bootstrap";
import {connect} from "react-redux";
import {hideDataSaved} from "../redux/actions/displayActions";


const DataSavedModal = (props) => {
    let btn = <Button bsStyle="danger" onClick={() => props.hideDataSaved()}>Close</Button>;
    let title = "Error!";
    let body = <div><span>Try again later or contact </span><a href="mailto:help@wormbase.org">Wormbase Helpdesk</a></div>;
    if (props.success) {
        if (props.last_widget) {
            btn = <Button bsStyle="success" onClick={() => props.hideDataSaved()}>Close</Button>;
            title =  "Congratulations!";
            body = "You have successfully submitted all your data to Wormbase. Thank you for your participation.";
        } else {
            btn = <Button bsStyle="success" onClick={props.goToNextSection}>Go to next section</Button>;
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
                <Modal.Footer>
                    {btn}
                </Modal.Footer>
            </Modal>
        );
    } else {
        return ("");
    }
}

export default connect(null, {hideDataSaved})(DataSavedModal);