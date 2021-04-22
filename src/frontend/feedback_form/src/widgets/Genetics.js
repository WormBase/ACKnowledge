import React from 'react';
import {
    Alert,
    Button, Checkbox, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {connect} from "react-redux";
import {
    addAllele, addOtherAllele, addOtherStrain,
    addStrain,
    removeAllele, removeOtherAllele, removeOtherStrain,
    removeStrain, setIsGeneticsSavedToDB, setOtherAlleles, setOtherStrains,
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
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";
import * as PropTypes from "prop-types";
import FormControl from "react-bootstrap/lib/FormControl";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";

function FormLabel(props) {
    return null;
}

FormLabel.propTypes = {children: PropTypes.node};

class Genetics extends React.Component {

    render() {
        const allelesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of alleles in your paper in the box below by adding or removing alleles if required. Note that not all the Million Mutation Project alleles are recognized
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
                    addItemFunction={(allele) => this.props.addAllele(allele)}
                    remItemFunction={(allele) => this.props.removeAllele(allele)}
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
                    addItemFunction={(strain) => this.props.addStrain(strain)}
                    remItemFunction={(strain) => this.props.removeStrain(strain)}
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
                                        <FormControl componentClass="textarea" rows="5" placeholder="Insert new alleles here (e.g. e1000), one per line"
                                                     value={this.props.otherAlleles.map(a => a.name).join("\n")}
                                                     onChange={e => this.props.setOtherAlleles(e.target.value.split("\n").map((a, index) => {
                                                         return {id: index + 1, name: a}}))}/>
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
                                        <FormControl componentClass="textarea" rows="5" placeholder="Insert new strains here (e.g. CB1001), one per line"
                                                     value={this.props.otherStrains.map(a => a.name).join("\n")}
                                                     onChange={e => this.props.setOtherStrains(e.target.value.split("\n").map((a, index) => {
                                                         return {id: index + 1, name: a}}))}/>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={() => {
                        let payload = {
                            alleles_list: transformEntitiesIntoAfpString(this.props.alleles, ""),
                            allele_seq_change: getCheckboxDBVal(this.props.sequenceChange.checked),
                            other_alleles: JSON.stringify(this.props.otherAlleles),
                            strains_list: transformEntitiesIntoAfpString(this.props.strains, ""),
                            other_strains: JSON.stringify(this.props.otherStrains),
                            passwd: this.props.paperPasswd
                        };
                        this.props.saveWidgetData(payload, WIDGET.GENETICS);
                    }}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({
    alleles: getAlleles(state).elements,
    sequenceChange: getSequenceChange(state),
    otherAlleles: getOtherAlleles(state).elements,
    strains: getStrains(state).elements,
    otherStrains: getOtherStrains(state).elements,
    isSavedToDB: isGeneticsSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {addAllele, removeAllele, addStrain, removeStrain, setSequenceChange,
    toggleSequenceChange, addOtherAllele, removeOtherAllele, addOtherStrain, removeOtherStrain, setOtherAlleles,
    setOtherStrains, showDataSaved, setIsGeneticsSavedToDB, saveWidgetData})(Genetics);