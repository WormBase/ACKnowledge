import React from 'react';
import {Button} from "react-bootstrap";

class Other extends React.Component {
    render() {
        return (
            <div>
                <p>Other</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "other")}>Next</Button>
            </div>
        );
    }
}

export default Other;