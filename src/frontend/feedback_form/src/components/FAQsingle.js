import React from "react";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";
import Collapse from "react-bootstrap/lib/Collapse";
import Well from "react-bootstrap/lib/Well";

class FAQsingle extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            open: false
        };
    }


    render(){
        return (
            <div>
                <a onClick={() => this.setState({ open: !this.state.open })}>{this.props.question}</a>
                <Collapse in={this.state.open}>
                    <div>
                        <Well>
                            <p dangerouslySetInnerHTML={{__html: this.props.answer}}/>
                        </Well>
                    </div>
                </Collapse>
            </div>

        );
    }
}

export default FAQsingle;


