import React from 'react';
import {
    Button,
    ButtonGroup,
    Checkbox,
    Form,
    FormControl,
    FormGroup,
    Glyphicon,
    OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";
import MultipleSelect from "../page_components/multiple_select";
import EditableTable from "../page_components/editable_table";

class Reagent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedTransgenes: props["selectedTransgenes"],
            cb_newantib: props["newAntib"],
            cb_newantib_details: props["newAntibDetails"],
            other_antib: props["otherAntibs"],
            transgeneSelect: undefined
        };

        this.check_cb_newantib = this.check_cb_newantib.bind(this);
        this.toggle_cb_newantib = this.toggle_cb_newantib.bind(this);
        this.searchWBTransgenes = this.searchWBTransgenes.bind(this);
    }

    check_cb_newantib() {
        this.setState({cb_newantib: true});
        this.props.newAntibCallback(true);
    }

    toggle_cb_newantib() {
        let newVal = !this.state.cb_newantib;
        this.setState({cb_newantib: newVal});
        this.props.newAntibCallback(newVal);
    }

    setSelectedTransgenes(transgenes) {
        this.transgeneSelect.setSelectedItems(transgenes);
    }

    setNewAntib(value) {
        this.setState({
            cb_newantib: value
        });
    }

    setNewAntibDetails(value) {
        this.setState({
            cb_newantib_details: value
        });
    }

    setOtherAntib(value) {
        this.setState({
            otherAntib: value
        });
    }

    searchWBTransgenes(searchString) {
        if (searchString !== "") {
            fetch('http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR&objectType=transgene&userValue=' +
                searchString)
                .then(res => {
                    if (res.status === 200) {
                        return res.text();
                    } else {
                        this.setState({show_fetch_data_error: true})
                    }
                }).then(data => {
                if (data === undefined) {
                    this.setState({show_fetch_data_error: true})
                } else {
                    this.transgeneSelect.setAvailableItems(data);
                }
            }).catch(() => this.setState({show_fetch_data_error: true}));
        } else {
            this.transgeneSelect.setAvailableItems("");
        }
    }

    render() {
        const transgenesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of transgenes in your paper in the box below by adding or removing strains if required.
            </Tooltip>
        );
        const antibodyTooltip = (
            <Tooltip id="tooltip">
                Click on Newly generated antibody and provide details if you generated an antibody in your lab. If you
                used an antibody generated in another study, add the Antibody name and PubMed ID of the original
                publication in the ‘Other Antibodies’ table.
            </Tooltip>
        );

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
                            <Panel.Title componentClass="h3">Transgenes in the paper <OverlayTrigger placement="top" overlay={transgenesTooltip}>
                                <Glyphicon glyph="question-sign"/>
                            </OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"transgene"}
                                itemsNamePlural={"transgenes"}
                                selectedItems={this.state.selectedTransgenes}
                                ref={instance => { this.transgeneSelect = instance; }}
                                selectedItemsCallback={this.props.selectedTransgenesCallback}
                                searchWBFunc={this.searchWBTransgenes}
                                sampleQuery={"e.g. ctIs40"}
                            />
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Antibodies in the paper <OverlayTrigger placement="top"
                                                                                                    overlay={antibodyTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <Form>
                                <FormGroup>
                                    <Checkbox checked={this.state.cb_newantib} onClick={this.toggle_cb_newantib}>
                                        <strong>Newly generated antibodies</strong>
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Enter antibody name and details here"
                                                 onClick={this.check_cb_newantib}
                                                 value={this.state.cb_newantib_details}
                                                 onChange={(event) => {this.setNewAntibDetails(event.target.value);
                                                 this.props.newAntibDetailsCallback(event.target.value)}}/>
                                    <br/>
                                    <EditableTable title={"Other Antibodies used"}
                                                   tableChangedCallback={this.props.otherAntibsCallback}
                                                   products={this.state.other_antib}
                                    />
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