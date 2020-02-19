import React from "react";
import {Alert} from "react-bootstrap";

class InstructionsAlert extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            alertTextNotSaved: props["alertTextNotSaved"],
            alertTextSaved: props["alertTextSaved"],
            alertTitleNotSaved: props["alertTitleNotSaved"],
            alertTitleSaved: props["alertTitleSaved"],
            alertBsStyleNotSaved: "info",
            alertBsStyleSaved: "success",
            show: true
        };

        this.handleDismiss = this.handleDismiss.bind(this);
    }

    handleDismiss() {
        this.setState({ show: false });
    }

    render() {
        let title = this.state.alertTitleNotSaved;
        let text = this.state.alertTextNotSaved;
        let bsstyle = this.state.alertBsStyleNotSaved;
        if (this.props.saved) {
            title = this.state.alertTitleSaved;
            text = this.state.alertTextSaved;
            bsstyle = this.state.alertBsStyleSaved;
        }
        if (this.state.show) {
            return (
                <Alert onDismiss={this.handleDismiss} bsStyle={bsstyle}>
                    <strong>{title}</strong><p>{text}</p>
                </Alert>
            );
        } else {
            return "";
        }
    }
}

export default InstructionsAlert;