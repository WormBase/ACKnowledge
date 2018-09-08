import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";
import MultipleSelect from "../page_components/multiple_select";
import EditableTable from "../page_components/editable_table";

class Genetics extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedAlleles: props["selectedAlleles"],
            selectedStrains: props["selectedStrains"],
            cb_allele: props["alleleSeqChange"],
            alleleSelect: undefined,
            strainSelect: undefined,
            otherAlleles: props["otherAlleles"],
            otherStrains: props["otherStrains"],
        };

        this.check_cb = props["checkCb"].bind(this);
        this.toggle_cb = props["toggleCb"].bind(this);
        this.searchWBAlleles = this.searchWBAlleles.bind(this);
        this.searchWBStrains = this.searchWBStrains.bind(this);
        this.selfStateVarModifiedFunction = this.selfStateVarModifiedFunction.bind(this);
    }

    setSelectedAlleles(allelelist) {
        this.alleleSelect.setSelectedItems(allelelist);
    }

    setSelecedStrains(strains) {
        this.strainSelect.setSelectedItems(strains);
    }

    selfStateVarModifiedFunction(value, stateVarName) {
        let stateElem = {};
        stateElem[stateVarName] = value;
        this.setState(stateElem);
    }

    searchWBAlleles(searchString) {
        if (searchString !== "") {
            fetch('http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR&objectType=variation&userValue=' +
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
                    this.alleleSelect.setAvailableItems(data);
                }
            }).catch(() => this.setState({show_fetch_data_error: true}));
        } else {
            this.alleleSelect.setAvailableItems("");
        }
    }

    searchWBStrains(searchString) {
        if (searchString !== "") {
            fetch('http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR&objectType=strain&userValue=' +
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
                    this.strainSelect.setAvailableItems(data);
                }
            }).catch(() => this.setState({show_fetch_data_error: true}));
        } else {
            this.strainSelect.setAvailableItems("");
        }
    }

    render() {
        const allelesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of alleles in your paper in the box below by adding or removing alleles if required.
            </Tooltip>
        );

        const strainsTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of strains in your paper in the box below by adding or removing strains if required.
            </Tooltip>
        );
        return (
            <div>
                <AlertDismissable title="" text="Here you can find alleles and strains that have
                been identified in your paper. Please validate the list as for the previous section. You can also
                indicate an allele sequence change and submit a new allele name." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Alleles in the paper <OverlayTrigger placement="top" overlay={allelesTooltip}>
                                <Glyphicon glyph="question-sign"/>
                            </OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"allele"}
                                itemsNamePlural={"alleles"}
                                selectedItems={this.state.selectedAlleles}
                                ref={instance => { this.alleleSelect = instance; }}
                                selectedItemsCallback={this.props.stateVarModifiedCallback}
                                stateVarName={"selectedAlleles"}
                                searchWBFunc={this.searchWBAlleles}
                                sampleQuery={"e.g. e1000"}
                            />
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Allele sequence change</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-7">
                                        <Checkbox checked={this.state.cb_allele}
                                                  onClick={() => this.toggle_cb("cb_allele", "alleleSeqChange")}><strong>Allele sequence change</strong></Checkbox>
                                    </div>
                                    <div className="col-sm-5">
                                        <Button bsStyle="info"
                                                href={"https://wormbase.org/submissions/allele_sequence.cgi"} target="_blank"
                                                onClick={() => this.check_cb("cb_allele", "alleleSeqChange")}>
                                            Add details in online form
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">New alleles</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <EditableTable title={"New Alleles"}
                                                       tableChangedCallback={this.props.stateVarModifiedCallback}
                                                       stateVarName={"otherAlleles"}
                                                       products={this.state.otherAlleles}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Strains in the paper <OverlayTrigger placement="top" overlay={strainsTooltip}>
                                    <Glyphicon glyph="question-sign"/>
                                </OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"strain"}
                                itemsNamePlural={"strains"}
                                selectedItems={this.state.selectedStrains}
                                ref={instance => { this.strainSelect = instance; }}
                                selectedItemsCallback={this.props.stateVarModifiedCallback}
                                stateVarName={"selectedStrains"}
                                searchWBFunc={this.searchWBStrains}
                                sampleQuery={"e.g. CB4856"}
                            />
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">New Strains</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <EditableTable title={"New Strains"}
                                                       tableChangedCallback={this.props.stateVarModifiedCallback}
                                                       stateVarName={"otherStrains"}
                                                       products={this.state.otherStrains}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "genetics")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Genetics;