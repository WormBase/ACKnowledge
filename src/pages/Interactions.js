import React from 'react';
import {Button} from "react-bootstrap";

class Interactions extends React.Component {
    render() {
        return (
            <div>
                <p>Interactions</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "interactions")}>Next</Button>
            </div>
        );
    }
}

export default Interactions;