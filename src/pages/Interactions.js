import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Form,
    Panel, Col
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";

class Interactions extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            cb_genetic: false,
            cb_physical: false,
            cb_regulatory: false
        };

        this.check_cb_genetic = this.check_cb_genetic.bind(this);
        this.toggle_cb_genetic = this.toggle_cb_genetic.bind(this);
        this.check_cb_physical = this.check_cb_physical.bind(this);
        this.toggle_cb_physical = this.toggle_cb_physical.bind(this);
        this.check_cb_regulatory = this.check_cb_regulatory.bind(this);
        this.toggle_cb_regulatory = this.toggle_cb_regulatory.bind(this);
    }

    check_cb_genetic() {
        this.setState({cb_genetic: true});
    }

    toggle_cb_genetic() {
        this.setState({cb_genetic: !this.state.cb_genetic});
    }

    check_cb_physical() {
        this.setState({cb_physical: true});
    }

    toggle_cb_physical() {
        this.setState({cb_physical: !this.state.cb_physical});
    }

    check_cb_regulatory() {
        this.setState({cb_regulatory: true});
    }

    toggle_cb_regulatory() {
        this.setState({cb_regulatory: !this.state.cb_regulatory});
    }

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
                        <Panel.Title componentClass="h3">Interaction data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <FormGroup>
                                <Checkbox checked={this.state.cb_genetic} onClick={this.toggle_cb_genetic}>
                                    <strong>Genetic Interactions</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_genetic}/>
                                <Checkbox checked={this.state.cb_physical} onClick={this.toggle_cb_physical}>
                                    <strong>Physical Interactions</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_physical}/>
                                <Checkbox checked={this.state.cb_regulatory} onClick={this.toggle_cb_regulatory}>
                                    <strong>Regulatory Interactions</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Add details here" onClick={this.check_cb_regulatory}/>
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