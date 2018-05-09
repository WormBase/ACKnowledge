import React from "react";
import {Alert} from "react-bootstrap";

class AlertDismissable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleDismiss = this.handleDismiss.bind(this);
        this.handleShow = this.handleShow.bind(this);

        let bsStyle = "";
        if (props["bsStyle"] !== undefined) {
            bsStyle = props["bsStyle"];
        }
        let text = "";
        if (props["text"] !== undefined) {
            text = props["text"];
        }
        let title = "";
        if (props["title"] !== undefined) {
            title = props["title"];
        }
        let show = true;
        if (props["show"] !== undefined) {
            show = props["show"];
        }
        this.state = {
            show: show,
            bsStyle: bsStyle,
            text: text,
            title: title
        };
    }

    handleDismiss() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    render() {
        if (this.state.show) {
            return (
                <Alert onDismiss={this.handleDismiss} bsStyle={this.state.bsStyle}>
                    <strong>{this.state.title}</strong><p>{this.state.text}</p>
                </Alert>
            );
        } else {
            return ("");
        }
    }
}

export default AlertDismissable;