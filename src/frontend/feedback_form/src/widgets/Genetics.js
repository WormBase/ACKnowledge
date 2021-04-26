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
import FormControl from "react-bootstrap/lib/FormControl";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Genetics = (props) => {

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
    if (props.hideAlleles) {
        allelesListComponent = (<Alert bsStyle="warning">More than 100 alleles were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of alleles click <a onClick={() => {
            props.toggleEntityVisibilityCallback("hide_alleles")
        }}>here</a>. If you prefer not to, all the alleles extracted will be associated to this paper in WormBase</Alert>);
    } else {
        allelesListComponent = (
            <MultipleSelect
                linkWB={"https://wormbase.org/species/c_elegans/variation"}
                itemsNameSingular={"allele"}
                itemsNamePlural={"alleles"}
                dataReaderFunction={getAlleles}
                addItemFunction={(allele) => props.addAllele(allele)}
                remItemFunction={(allele) => props.removeAllele(allele)}
                searchType={"variation"}
                sampleQuery={"e.g. e1000"}
                listIDsAPI={'http://rest.wormbase.org/rest/field/variation/'}
            />);
    }
    let strainsListComponent;
    if (props.hideStrains) {
        strainsListComponent = (<Alert bsStyle="warning">More than 100 strains were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of strains click <a onClick={() => {
            props.toggleEntityVisibilityCallback("hide_strains")
        }}>here</a>. If you prefer not to, all the strains extracted will be associated to this paper in WormBase</Alert>);
    } else {
        strainsListComponent = (
            <MultipleSelect
                linkWB={"https://wormbase.org/species/c_elegans/strain"}
                itemsNameSingular={"strain"}
                itemsNamePlural={"strains"}
                dataReaderFunction={getStrains}
                addItemFunction={(strain) => props.addStrain(strain)}
                remItemFunction={(strain) => props.removeStrain(strain)}
                searchType={"strain"}
                sampleQuery={"e.g. CB4856"}
                listIDsAPI={'http://rest.wormbase.org/rest/field/strain/'}
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
                saved={props.isSavedToDB}
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
                                                 value={props.otherAlleles.map(a => a.name).join("\n")}
                                                 onChange={e => props.setOtherAlleles(e.target.value.split("\n").map((a, index) => {
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
                                    <Checkbox checked={props.sequenceChange.checked}
                                              onClick={() => {
                                                  props.toggleSequenceChange();
                                              }}><strong>Allele sequence change</strong> <OverlayTrigger placement="top"
                                                                                                         overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                            onClick={() => {
                                                props.setSequenceChange(true, '');
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
                                                 value={props.otherStrains.map(a => a.name).join("\n")}
                                                 onChange={e => props.setOtherStrains(e.target.value.split("\n").map((a, index) => {
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
                        alleles_list: transformEntitiesIntoAfpString(props.alleles, ""),
                        allele_seq_change: getCheckboxDBVal(props.sequenceChange.checked),
                        other_alleles: JSON.stringify(props.otherAlleles),
                        strains_list: transformEntitiesIntoAfpString(props.strains, ""),
                        other_strains: JSON.stringify(props.otherStrains),
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.GENETICS);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
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