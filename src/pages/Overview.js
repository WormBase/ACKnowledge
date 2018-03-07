import React from 'react';
import {Button} from "react-bootstrap";

class Overview extends React.Component {
    render() {
        return (
            <div>
                <p>Overview</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "overview")}>Next</Button>
            </div>
        );
    }
}

export default Overview;