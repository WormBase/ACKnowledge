import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Form,
    Panel, Col
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Interactions extends React.Component {
    render() {
        return (
            <div>
                <AlertDismissable title="" text="Here you can find interaction data that have
                been identified in your paper. Please select/deselect the appropriate checkboxes and add any additional
                information." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
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