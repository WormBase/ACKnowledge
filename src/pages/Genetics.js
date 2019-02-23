import React from 'react';
import {
    Button, Checkbox, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../page_components/MultiSelect";
import OneColumnEditableTable from "../page_components/EditableOneColsTable";
import InstructionsAlert from "../main_layout/InstructionsAlert";

class Genetics extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            saved: props["saved"],
            selectedAlleles: props["selectedAlleles"],
            selectedStrains: props["selectedStrains"],
            cb_allele: props["alleleSeqChange"],
            alleleSelect: undefined,
            strainSelect: undefined,
            otherAlleles: props["otherAlleles"],
            otherStrains: props["otherStrains"]
        };

        this.check_cb = props["checkCb"].bind(this);
        this.toggle_cb = props["toggleCb"].bind(this);
        this.selfStateVarModifiedFunction = this.selfStateVarModifiedFunction.bind(this);
    }

    setSelectedAlleles(allelelist) {
        this.alleleSelect.setSelectedItems(allelelist);
    }

    setSelectedStrains(strains) {
        this.strainSelect.setSelectedItems(strains);
    }

    selfStateVarModifiedFunction(value, stateVarName) {
        let stateElem = {};
        stateElem[stateVarName] = value;
        this.setState(stateElem);
    }

    setOtherAlleles(otherAlleles) {
        this.otherAllelesTable.updateProducts(otherAlleles);
    }

    setOtherStrains(otherStrains) {
        this.otherStrainsTable.updateProducts(otherStrains);
    }

    setSuccessAlertMessage() {
        this.alertDismissable.setSaved(true);
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
        const svmTooltip = (
            <Tooltip id="tooltip">
                This field is prepopulated by Textpresso Central.
            </Tooltip>
        );
        return (
            <div>
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="Here you can find alleles and strains that have been identified in your paper.
                    Please validate the list as for the previous section. You can also indicate an allele sequence
                    change and submit a new allele name."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.state.saved}
                    ref={instance => { this.alertDismissable = instance; }}
                />
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">List of WormBase alleles identified in the paper <OverlayTrigger placement="top" overlay={allelesTooltip}>
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
                                searchType={"variation"}
                                sampleQuery={"e.g. e1000"}
                            />
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
                                        <OneColumnEditableTable
                                            title={""}
                                            tableChangedCallback={this.props.stateVarModifiedCallback}
                                            stateVarName={"otherAlleles"}
                                            products={this.state.otherAlleles}
                                            sampleText={"e.g. e1000"}
                                            ref={instance => { this.otherAllelesTable = instance; }}
                                        />
                                    </div>
                                </div>
                            </div>
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
                                                  onClick={() => {
                                                      this.toggle_cb("cb_allele", "alleleSeqChange");
                                                  }}><strong>Allele sequence change</strong> <OverlayTrigger placement="top"
                                                                                                             overlay={svmTooltip}>
                                            <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                    </div>
                                    <div className="col-sm-5">
                                        <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                                onClick={() => {
                                                    window.open("https://wormbase.org/submissions/allele_sequence.cgi", "_blank");
                                                    this.check_cb("cb_allele", "alleleSeqChange");}
                                                }>
                                            Add details in online form
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">List of WormBase strains identified in the paper <OverlayTrigger placement="top" overlay={strainsTooltip}>
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
                                searchType={"strain"}
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
                                        <OneColumnEditableTable
                                            title={""}
                                            tableChangedCallback={this.props.stateVarModifiedCallback}
                                            stateVarName={"otherStrains"}
                                            products={this.state.otherStrains}
                                            sampleText={"e.g. CB1001"}
                                            ref={instance => { this.otherStrainsTable = instance; }}
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