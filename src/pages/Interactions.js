import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Form,
    Panel
} from "react-bootstrap";

class Interactions extends React.Component {
    render() {
        return (
            <div>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Categories Identified by Textpresso</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form horizontal>
                            <Checkbox>
                                Genetic Interactions
                            </Checkbox>
                            <Checkbox>
                                Physical Interactions
                            </Checkbox>
                            <Checkbox>
                                Regulatory Interactions
                            </Checkbox>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="primary" onClick={this.props.callback.bind(this, "interactions")}>Next</Button>
                </div>
            </div>
        );
    }
}

export default Interactions;