import React from 'react';
import {Button} from "react-bootstrap";

class Phenotypes extends React.Component {
    render() {
        return (
            <div>
                <p>Phenotypes</p>
                <Button bsStyle="primary" onClick={this.props.callback.bind(this, "phenotypes")}>Next</Button>
            </div>
        );
    }
}

export default Phenotypes;