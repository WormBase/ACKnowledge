import React, {useState} from "react";
import {Alert} from "react-bootstrap";

const InstructionsAlert = (props) => {

    const [show, setShow] = useState(true);

    let title = props["alertTitleNotSaved"];
    let text = props["alertTextNotSaved"];
    let bsstyle = "info";
    if (props.saved) {
        title = props["alertTitleSaved"];
        text = props["alertTextSaved"];
        bsstyle = "success";
    }
    if (show) {
        return (
            <Alert onDismiss={() => setShow(false)} bsStyle={bsstyle}>
                <strong>{title}</strong><p>{text}</p>
            </Alert>
        );
    } else {
        return "";
    }
}

export default InstructionsAlert;