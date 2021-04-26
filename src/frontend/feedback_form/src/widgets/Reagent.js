import React from 'react';
import {
    Button,
    Checkbox,
    Form,
    FormControl,
    FormGroup,
    Glyphicon,
    OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {connect} from "react-redux";
import {
    addOtherAntibody, addOtherTransgene,
    addTransgene, removeOtherAntibody, removeOtherTransgene,
    removeTransgene, setIsReagentSavedToDB,
    setNewAntibodies, setOtherAntibodies, setOtherTransgenes,
    toggleNewAntibodies
} from "../redux/actions/reagentActions";
import {
    getNewAntibodies,
    getOtherAntibodies,
    getOtherTransgenes,
    getTransgenes, isReagentSavedToDB
} from "../redux/selectors/reagentSelectors";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Reagent = (props) => {

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
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="Here you can find transgenes that have been identified in your paper. Please
                    validate the list as for the previous section. You can also submit information about antibodies
                    mentioned or generated in the study."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={props.isSavedToDB}
            />
            <form>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">List of WormBase transgenes identified in the paper <OverlayTrigger placement="top" overlay={transgenesTooltip}>
                            <Glyphicon glyph="question-sign"/>
                        </OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <MultipleSelect
                            linkWB={"https://wormbase.org/species/c_elegans/transgene"}
                            itemsNameSingular={"transgene"}
                            itemsNamePlural={"transgenes"}
                            dataReaderFunction={getTransgenes}
                            addItemFunction={(transgene) => props.addTransgene(transgene)}
                            remItemFunction={(transgene) => props.removeTransgene(transgene)}
                            searchType={"transgene"}
                            sampleQuery={"e.g. ctIs40"}
                            listIDsAPI={'http://rest.wormbase.org/rest/field/transgene/'}
                        />
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">New Transgenes</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert new transgenes here (e.g. ctls40 or ycEx60), one per line"
                                                 value={props.otherTransgenes.map(a => a.name).join("\n")}
                                                 onChange={e => props.setOtherTransgenes(e.target.value.split("\n").map((a, index) => {
                                                     return {id: index + 1, name: a}}))}/>
                                </div>
                            </div>
                        </div>
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
                                <Checkbox checked={props.newAntibodies.checked} onClick={props.toggleNewAntibodies}>
                                    <strong>Newly generated antibodies</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Enter antibody name and details here"
                                             onClick={props.setNewAntibodies}
                                             value={props.newAntibodies.details}
                                             onChange={(event) => {props.setNewAntibodies(true, event.target.value);}}/>
                                <br/>
                                <ControlLabel>Other Antibodies Used</ControlLabel>
                                <FormControl componentClass="textarea" rows="5" placeholder="Insert antibodies here (optionally followed by PMID: 'antibody_name || PMID'), one per line"
                                             value={props.otherAntibodies.map(a => {
                                                 if (a.name) {
                                                     if (a.publicationId !== undefined) {
                                                         return a.name + " || " + a.publicationId
                                                     } else {
                                                         return a.name
                                                     }}}).join("\n")}
                                             onChange={e => props.setOtherAntibodies(e.target.value.split("\n").map((a, index) => {
                                                 return {id: index + 1, name: a.split(" || ")[0], publicationId: a.split(" || ")[1]}}))}/>
                                <FormControl.Feedback />
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    const payload = {
                        transgenes_list: transformEntitiesIntoAfpString(props.transgenes, ""),
                        new_transgenes: JSON.stringify(props.otherTransgenes),
                        new_antibody: getCheckboxDBVal(props.newAntibodies.checked, props.newAntibodies.details),
                        other_antibodies: JSON.stringify(props.otherAntibodies),
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.REAGENT);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    transgenes: getTransgenes(state).elements,
    otherTransgenes: getOtherTransgenes(state).elements,
    newAntibodies: getNewAntibodies(state),
    otherAntibodies: getOtherAntibodies(state).elements,
    isSavedToDB: isReagentSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {addTransgene, removeTransgene, setNewAntibodies, toggleNewAntibodies,
    addOtherTransgene, removeOtherTransgene, setOtherTransgenes, addOtherAntibody, removeOtherAntibody,
    setOtherAntibodies, showDataSaved, setIsReagentSavedToDB, saveWidgetData})(Reagent);