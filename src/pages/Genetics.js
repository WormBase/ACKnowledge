import React from 'react';
import {Button} from "react-bootstrap";

class Genetics extends React.Component {
    render() {
        return (
            <div>
                <p>Genetics</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "genetics")}>Next</Button>
            </div>
        );
    }
}

export default Genetics;