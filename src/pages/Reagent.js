import React from 'react';
import {Button, ButtonGroup, Checkbox, Form, FormControl, FormGroup, Glyphicon, Panel} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";
import MultipleSelect from "../page_components/multiple_select";

class Reagent extends React.Component {
    render() {
        return (
            <div>
                <AlertDismissable title="" text="Here you can find transgenes that have been identified in your paper.
                Please validate the list as for the previous section. You can also submit information about antibodies
                mentioned or generated in the study." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Transgenes in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect itemsNameSingular={"transgene"} itemsNamePlural={"transgenes"}/>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Antibodies in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <Form>
                                <FormGroup>
                                    <Checkbox>
                                        Newly generated antibodies
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Enter antibody name and details here"/>
                                    <Checkbox>
                                        Other antibodies used
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Enter name and details here"/>
                                    <br/>
                                    <FormControl type="text" placeholder="Original Publication: PMID"/>
                                    <FormControl.Feedback />
                                </FormGroup>
                            </Form>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "reagent")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Reagent;