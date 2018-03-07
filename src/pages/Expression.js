import React from 'react';
import Button from "react-bootstrap/es/Button";

class Expression extends React.Component {
    render() {
        return (
            <div>
                <p>Expression</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "expression")}>Next</Button>
            </div>
        );
    }
}

export default Expression;