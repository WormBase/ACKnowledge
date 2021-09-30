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
import InstructionsAlert from "../components/InstructionsAlert";
import {useDispatch, useSelector} from "react-redux";
import {
    addTransgene,
    removeTransgene,
    setNewAntibodies, setOtherAntibodies, setOtherTransgenes,
    toggleNewAntibodies
} from "../redux/actions/reagentActions";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import {WIDGET} from "../constants";
import {saveWidgetData} from "../redux/actions/widgetActions";

const Reagent = () => {
    const dispatch = useDispatch();
    const transgenes = useSelector((state) => state.reagent.transgenes.elements);
    const addedTransgenes = useSelector((state) => state.reagent.addedTransgenes);
    const newAntibodies = useSelector((state) => state.reagent.newAntibodies);
    const otherTransgenes = useSelector((state) => state.reagent.otherTransgenes.elements);
    const otherAntibodies = useSelector((state) => state.reagent.otherAntibodies.elements);
    const isSavedToDB = useSelector((state) => state.reagent.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

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
                saved={isSavedToDB}
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
                            items={transgenes}
                            addedItems={addedTransgenes}
                            addItemFunction={(transgene) => dispatch(addTransgene(transgene))}
                            remItemFunction={(transgene) => dispatch(removeTransgene(transgene))}
                            searchType={"transgene"}
                            sampleQuery={"e.g. ctIs40"}
                            autocompletePlaceholder={"Enter one or more Transgene name or ID, e.g. inIs179 or WBTransgene00000647, separated by comma, tab, or new line. Then, select from the autocomplete list and click on 'Add selected'"}
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
                                    <ControlLabel>
                                        Enter one transgene per line. If possible, enter the transgene name followed by genotype followed by species, separated by comma. <br/>
                                        e.g. <i>eaIs15</i>, [<i>Ppie-1::HIM-5::GFP::pie-1</i>], <i>C. elegans</i>. <br/>
                                        For extrachromosomal arrays: <i>sqEx67</i>, [<i>rgef-1p::mcherry::GFP::lgg-1 + rol-6</i>], <i>C. elegans</i>
                                    </ControlLabel>
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert new transgenes here, one per line"
                                                 value={otherTransgenes.map(a => a.name).join("\n")}
                                                 onChange={e => dispatch(setOtherTransgenes(e.target.value.split("\n").map((a, index) => {
                                                     return {id: index + 1, name: a}})))}/>
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
                                <Checkbox checked={newAntibodies.checked} onClick={dispatch(toggleNewAntibodies)}>
                                    <strong>Newly generated antibodies</strong>
                                </Checkbox>
                                <FormControl type="text" placeholder="Enter antibody name and details here"
                                             onClick={() => dispatch(setNewAntibodies())}
                                             value={newAntibodies.details}
                                             onChange={(event) => {dispatch(setNewAntibodies(true, event.target.value))}}/>
                                <br/>
                                <ControlLabel>Other Antibodies Used</ControlLabel>
                                <FormControl componentClass="textarea" rows="5" placeholder="Insert antibodies here (optionally followed by PMID: 'antibody_name || PMID'), one per line"
                                             value={otherAntibodies.map(a => {
                                                 if (a.name) {
                                                     if (a.publicationId !== undefined) {
                                                         return a.name + " || " + a.publicationId
                                                     } else {
                                                         return a.name
                                                     }}}).join("\n")}
                                             onChange={e => dispatch(setOtherAntibodies(e.target.value.split("\n").map((a, index) => {
                                                 return {id: index + 1, name: a.split(" || ")[0], publicationId: a.split(" || ")[1]}})))}/>
                                <FormControl.Feedback />
                            </FormGroup>
                        </Form>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    const payload = {
                        transgenes_list: transformEntitiesIntoAfpString(transgenes, ""),
                        new_transgenes: JSON.stringify(otherTransgenes),
                        new_antibody: getCheckboxDBVal(newAntibodies.checked, newAntibodies.details),
                        other_antibodies: JSON.stringify(otherAntibodies),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.REAGENT));
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

export default Reagent;
