import React from 'react';
import {
    Alert,
    Button, Checkbox, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import OneColumnEditableTable from "../components/EditableOneColsTable";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {connect} from "react-redux";
import {
    addAllele, addOtherAllele, addOtherStrain,
    addStrain,
    removeAllele, removeOtherAllele, removeOtherStrain,
    removeStrain,
    setSequenceChange,
    toggleSequenceChange
} from "../redux/actions/geneticsActions";
import {
    getAlleles,
    getOtherAlleles,
    getOtherStrains,
    getSequenceChange,
    getStrains, isGeneticsSavedToDB
} from "../redux/selectors/geneticsSelectors";

class Genetics extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.addAlleleFunction = this.addAlleleFunction.bind(this);
        this.remAlleleFunction = this.remAlleleFunction.bind(this);
        this.addStrainFunction = this.addStrainFunction.bind(this);
        this.remStrainFunction = this.remStrainFunction.bind(this);
    }

    addAlleleFunction(allele) {
        this.props.addAllele(allele);
    }

    remAlleleFunction(allele) {
        this.props.removeAllele(allele);
    }

    addStrainFunction(allele) {
        this.props.addStrain(allele);
    }

    remStrainFunction(allele) {
        this.props.removeStrain(allele);
    }

    setSuccessAlertMessage() {
        this.alertDismissable.setSaved(true);
    }

    render() {
        const allelesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of alleles in your paper in the box below by adding or removing alleles if required. Only alleles mentioned 2 or more times are extracted; note that not all the Million Mutation Project alleles are recognized
            </Tooltip>
        );

        const strainsTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of strains in your paper in the box below by adding or removing strains if required. Strains mentioned at least once are extracted
            </Tooltip>
        );
        const svmTooltip = (
            <Tooltip id="tooltip">
                This field is prepopulated by Textpresso Central.
            </Tooltip>
        );
        let allelesListComponent;
        if (this.props.hideAlleles) {
            allelesListComponent = (<Alert bsStyle="warning">More than 100 alleles were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of alleles click <a onClick={() => {
                this.props.toggleEntityVisibilityCallback("hide_alleles")
            }}>here</a>. If you prefer not to, all the alleles extracted will be associated to this paper in WormBase</Alert>);
        } else {
            allelesListComponent = (
                <MultipleSelect
                    itemsNameSingular={"allele"}
                    itemsNamePlural={"alleles"}
                    dataReaderFunction={getAlleles}
                    addItemFunction={this.addAlleleFunction}
                    remItemFunction={this.remAlleleFunction}
                    searchType={"variation"}
                    sampleQuery={"e.g. e1000"}
                />);
        }
        let strainsListComponent;
        if (this.props.hideStrains) {
            strainsListComponent = (<Alert bsStyle="warning">More than 100 strains were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of strains click <a onClick={() => {
                this.props.toggleEntityVisibilityCallback("hide_strains")
            }}>here</a>. If you prefer not to, all the strains extracted will be associated to this paper in WormBase</Alert>);
        } else {
            strainsListComponent = (
                <MultipleSelect
                    itemsNameSingular={"strain"}
                    itemsNamePlural={"strains"}
                    dataReaderFunction={getStrains}
                    addItemFunction={this.addStrainFunction}
                    remItemFunction={this.remStrainFunction}
                    searchType={"strain"}
                    sampleQuery={"e.g. CB4856"}
                />);
        }
        return (
            <div>
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="Here you can find alleles and strains that have been identified in your paper.
                    Please validate the list as for the previous section. You can also indicate an allele sequence
                    change and submit a new allele name."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.props.isSavedToDB}
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
                            {allelesListComponent}
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
                                            stateVarName={"otherAlleles"}
                                            products={this.props.otherAlleles}
                                            sampleText={"e.g. e1000"}
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
                                        <Checkbox checked={this.props.sequenceChange.checked}
                                                  onClick={() => {
                                                      this.props.toggleSequenceChange();
                                                  }}><strong>Allele sequence change</strong> <OverlayTrigger placement="top"
                                                                                                             overlay={svmTooltip}>
                                            <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                    </div>
                                    <div className="col-sm-5">
                                        <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                                onClick={() => {
                                                    this.props.setSequenceChange(true, '');
                                                    window.open("https://wormbase.org/submissions/allele_sequence.cgi", "_blank");
                                                }}>
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
                            {strainsListComponent}
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
                                            stateVarName={"otherStrains"}
                                            products={this.props.otherStrains}
                                            sampleText={"e.g. CB1001"}
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


const mapStateToProps = state => ({
    alleles: getAlleles(state),
    strains: getStrains(state),
    sequenceChange: getSequenceChange(state),
    otherAlleles: getOtherAlleles(state),
    otherStrains: getOtherStrains(state),
    isSavedToDB: isGeneticsSavedToDB(state)
});

export default connect(mapStateToProps, {addAllele, removeAllele, addStrain, removeStrain, setSequenceChange, toggleSequenceChange, addOtherAllele, removeOtherAllele, addOtherStrain, removeOtherStrain})(Genetics);