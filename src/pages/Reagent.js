import React from 'react';
import {Button} from "react-bootstrap";

class Reagent extends React.Component {
    render() {
        return (
            <div>
                <p>Reagent</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "reagent")}>Next</Button>
            </div>
        );
    }
}

export default Reagent;