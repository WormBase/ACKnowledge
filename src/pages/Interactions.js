import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Form,
    Panel, Col
} from "react-bootstrap";

class Interactions extends React.Component {
    render() {
        return (
            <div>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Data in your paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox>
                                    Genetic Interactions
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"/>
                                <Checkbox>
                                    Physical Interactions
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"/>
                                <Checkbox>
                                    Regulatory Interactions
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here"/>
                                <FormControl.Feedback />
                        </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "interactions")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Interactions;