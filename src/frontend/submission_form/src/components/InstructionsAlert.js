import React from "react";
import {Alert} from "react-bootstrap";

const InstructionsAlert = (props) => {

    let title = props["alertTitleNotSaved"];
    let text = props["alertTextNotSaved"];
    let bsstyle = "info";
    if (props.saved) {
        title = props["alertTitleSaved"];
        text = props["alertTextSaved"];
        bsstyle = "success";
    }
    return (
        <Alert bsStyle={bsstyle}>
            <strong>{title}</strong><p>{text}</p>
        </Alert>
    );
}

export default InstructionsAlert;