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
import {setLoading, showDataSaved, unsetLoading} from "../redux/actions/displayActions";
import {DataManager} from "../lib/DataManager";
import ControlLabel from "react-bootstrap/lib/ControlLabel";

class Reagent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            dataManager: new DataManager()
        };
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
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="Here you can find transgenes that have been identified in your paper. Please
                    validate the list as for the previous section. You can also submit information about antibodies
                    mentioned or generated in the study."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.props.isSavedToDB}
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
                                itemsNameSingular={"transgene"}
                                itemsNamePlural={"transgenes"}
                                dataReaderFunction={getTransgenes}
                                addItemFunction={(transgene) => this.props.addTransgene(transgene)}
                                remItemFunction={(transgene) => this.props.removeTransgene(transgene)}
                                searchType={"transgene"}
                                sampleQuery={"e.g. ctIs40"}
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
                                                     value={this.props.otherTransgenes.map(a => a.name).join("\n")}
                                                     onChange={e => this.props.setOtherTransgenes(e.target.value.split("\n").map((a, index) => {
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
                                    <Checkbox checked={this.props.newAntibodies.checked} onClick={this.props.toggleNewAntibodies}>
                                        <strong>Newly generated antibodies</strong>
                                    </Checkbox>
                                    <FormControl type="text" placeholder="Enter antibody name and details here"
                                                 onClick={this.props.setNewAntibodies}
                                                 value={this.props.newAntibodies.details}
                                                 onChange={(event) => {this.props.setNewAntibodies(true, event.target.value);}}/>
                                    <br/>
                                    <ControlLabel>Other Antibodies Used</ControlLabel>
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert antibodies here (optionally followed by PMID: 'antibody_name || PMID'), one per line"
                                                     value={this.props.otherAntibodies.map(a => {
                                                         if (a.name) {
                                                             if (a.publicationId !== undefined) {
                                                                 return a.name + " || " + a.publicationId
                                                             } else {
                                                                 return a.name
                                                             }}}).join("\n")}
                                                     onChange={e => this.props.setOtherAntibodies(e.target.value.split("\n").map((a, index) => {
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
                            transgenes_list: transformEntitiesIntoAfpString(this.props.transgenes, ""),
                            new_transgenes: JSON.stringify(this.props.otherTransgenes),
                            new_antibody: getCheckboxDBVal(this.props.newAntibodies.checked, this.props.newAntibodies.details),
                            other_antibodies: JSON.stringify(this.props.otherAntibodies)
                        };
                        this.props.setLoading();
                        this.state.dataManager.postWidgetData(payload)
                            .then(() => {
                                this.props.setIsReagentSavedToDB();
                                this.props.showDataSaved(true, false);
                            })
                            .catch((error) => {
                                this.props.showDataSaved(false, false)
                            }).finally(() => this.props.unsetLoading());
                    }}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    transgenes: getTransgenes(state).elements,
    otherTransgenes: getOtherTransgenes(state).elements,
    newAntibodies: getNewAntibodies(state),
    otherAntibodies: getOtherAntibodies(state).elements,
    isSavedToDB: isReagentSavedToDB(state)
});

export default connect(mapStateToProps, {addTransgene, removeTransgene, setNewAntibodies, toggleNewAntibodies,
    addOtherTransgene, removeOtherTransgene, setOtherTransgenes, addOtherAntibody, removeOtherAntibody,
    setOtherAntibodies, showDataSaved, setIsReagentSavedToDB, setLoading, unsetLoading})(Reagent);