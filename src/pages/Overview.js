import React from 'react';
import {
    Button, Checkbox, FormControl, Glyphicon, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../page_components/MultiSelect";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {WIDGET} from "../main_layout/MenuAndWidgets"

class Overview extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            saved: props["saved"],
            selectedGenes: props["selectedGenes"],
            selectedSpecies: props["selectedSpecies"],
            cb_gmcorr: props["geneModCorr"],
            cb_gmcorr_details: props["geneModCorrDetails"],
            show_fetch_data_error: false,
            geneSelect: undefined,
            speciesSelect: undefined
        };

        this.check_cb = props["checkCb"].bind(this);
        this.toggle_cb = props["toggleCb"].bind(this);
        this.selfStateVarModifiedFunction = this.selfStateVarModifiedFunction.bind(this);
    }

    setSelectedGenes(genelist) {
        this.geneSelect.setSelectedItems(genelist);
    }

    setSelectedSpecies(species) {
        this.speciesSelect.setSelectedItems(species, true);
    }

    selfStateVarModifiedFunction(value, stateVarName) {
        let stateElem = {};
        stateElem[stateVarName] = value;
        this.setState(stateElem);
    }

    setSuccessAlertMessage() {
        this.alertDismissable.setSaved(true);
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
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="In this page you will see genes and species that have been identified in your
                    paper. Please validate the list by adding/removing entries in the identified lists. You can also
                    notify us for gene model updates."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.state.saved}
                    ref={instance => { this.alertDismissable = instance; }}
                />
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
                                selectedItemsCallback={this.props.stateVarModifiedCallback}
                                stateVarName={"selectedGenes"}
                                searchType={"gene"}
                                sampleQuery={"e.g. dbl-1"}
                            />
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Gene model updates</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Checkbox checked={this.state.cb_gmcorr}
                                                  onClick={() => this.toggle_cb("cb_gmcorr", "geneModCorrection")}>
                                            <strong>Gene model correction/update</strong></Checkbox>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormControl type="text" placeholder="Add details here"
                                                     value={this.state.cb_gmcorr_details}
                                                     onClick={() => this.check_cb("cb_gmcorr", "geneModCorrection")}
                                                     onChange={(event) => {
                                                         this.props.stateVarModifiedCallback(event.target.value, "geneModCorrectionDetails");
                                                         this.selfStateVarModifiedFunction(event.target.value, "cb_gmcorr_details")
                                                     }}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">&nbsp;</div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                            this.check_cb("cb_gmcorr", "geneModCorrection");
                                            window.open("http://www.wormbase.org/submissions/gene_name.cgi", "_blank");
                                        }}>
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
                                selectedItemsCallback={this.props.stateVarModifiedCallback}
                                stateVarName={"selectedSpecies"}
                                searchType={"species"}
                                sampleQuery={"e.g. Caenorhabditis"}
                            />
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, WIDGET.OVERVIEW)}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Overview;