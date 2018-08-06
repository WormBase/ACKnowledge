import React from 'react';
import {
    Alert,
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Modal, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from '../main_layout/AlertDismissable'
import MultipleSelect from "../page_components/multiple_select";

class Overview extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: '',
            selectedGenes: props["selectedGenes"],
            selectedSpecies: props["selectedSpecies"],
            cb_gmcorr: props["geneModCorr"],
            cb_gmcorr_details: props["geneModCorrDetails"]
        };

        this.handleChange = this.handleChange.bind(this);
        this.check_genemodel_cb = this.check_genemodel_cb.bind(this);
        this.toggle_cb_gmcorr = this.toggle_cb_gmcorr.bind(this);
        this.searchWBGenes = this.searchWBGenes.bind(this);
    }

    getValidationState() {
        const length = this.state.value.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
        return null;
    }

    check_genemodel_cb() {
        this.setState({cb_gmcorr: true});
        this.props.geneModCorrCallback(true);
    }

    toggle_cb_gmcorr() {
        let newval = !this.state.cb_gmcorr;
        this.setState({cb_gmcorr: newval});
        this.props.geneModCorrCallback(newval);
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    setSelectedGenes(genelist) {
        this.geneSelect.setSelectedItems(genelist);
    }

    setSelecedSpecies(species) {
        this.speciesSelect.setSelectedItems(species);
    }

    setGMCorrection(value) {
        this.setState({
            cb_gmcorr: value
        });
    }

    setGMCorrectionDetails(value) {
        this.setState({
            cb_gmcorr_details: value
        });
    }

    searchWBGenes(searchString) {
        fetch('http://tazendra.caltech.edu/~azurebrd/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR&objectType=gene&userValue=' +
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
            }
            alert(data);
        }).catch(() => this.setState({show_fetch_data_error: true}));
    }

    render() {
        const geneTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of genes in your paper in the box below by adding or removing genes if required.
            </Tooltip>
        );

        const speciesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of species in your paper in the box below by adding or removing species if required.
            </Tooltip>
        );

        return (
            <div>
                <AlertDismissable title="Let's get started!" text="In this page you will see genes and species that have
                been identified in your paper. Please validate the list by adding/removing entries in the identified
                lists. You can also notify us for gene model updates." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Genes in the paper <OverlayTrigger placement="top"
                                                                                                overlay={geneTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"gene"}
                                itemsNamePlural={"genes"}
                                selectedItems={this.state.selectedGenes}
                                ref={instance => { this.geneSelect = instance; }}
                                selectedItemsCallback={this.props.selectedGenesCallback}
                                searchWBFunc={this.searchWBGenes}
                            />
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Gene model updates</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div>
                                    <Checkbox checked={this.state.cb_gmcorr}
                                              onClick={this.toggle_cb_gmcorr}>
                                        <strong>Gene model correction/update</strong></Checkbox>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormControl type="text" placeholder="Add details here"
                                                     value={this.state.cb_gmcorr_details}
                                                     onClick={this.check_genemodel_cb}
                                                     onChange={(event) => {
                                                         this.props.geneModCorrDetailsCallback(event.target.value);
                                                         this.setGMCorrectionDetails(event.target.value)
                                                     }}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">&nbsp;</div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button bsStyle="info" onClick={this.check_genemodel_cb}>
                                            Request New Gene Name/Report Gene-Sequence
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Species in the paper <OverlayTrigger placement="top"
                                                                                                  overlay={speciesTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"species"}
                                itemsNamePlural={"species"}
                                selectedItems={this.state.selectedSpecies}
                                ref={instance => { this.speciesSelect = instance; }}
                                selectedItemsCallback={this.props.selectedSpeciesCallback}
                            />
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "overview")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Overview;