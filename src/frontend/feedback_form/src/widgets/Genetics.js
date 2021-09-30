import React from 'react';
import {
    Alert,
    Button, Checkbox, Glyphicon, Image, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../components/InstructionsAlert";
import {connect, useDispatch, useSelector} from "react-redux";
import {
    addAllele, addOtherAllele, addOtherStrain,
    addStrain,
    removeAllele, removeOtherAllele, removeOtherStrain,
    removeStrain, setIsGeneticsSavedToDB, setOtherAlleles, setOtherStrains,
    setSequenceChange, setStrainAlreadyPresentError,
    toggleSequenceChange
} from "../redux/actions/geneticsActions";
import {
    getAddedAlleles,
    getAddedStrains,
    getAlleles,
    getOtherAlleles,
    getOtherStrains,
    getSequenceChange, getStrainAlreadyPresentError,
    getStrains, isGeneticsSavedToDB
} from "../redux/selectors/geneticsSelectors";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";
import FormControl from "react-bootstrap/lib/FormControl";
import {WIDGET} from "../constants";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Modal from "react-bootstrap/lib/Modal";

const Genetics = ({hideAlleles, hideStrains, toggleEntityVisibilityCallback}) => {
    const dispatch = useDispatch();
    const alleles = useSelector((state) => state.genetics.alleles.elements);
    const addedAlleles = useSelector((state) => state.genetics.addedAlleles);
    const otherAlleles = useSelector((state) => state.genetics.otherAlleles.elements);
    const strains = useSelector((state) => state.genetics.strains.elements);
    const addedStrains = useSelector((state) => state.genetics.addedStrains);
    const otherStrains = useSelector((state) => state.genetics.otherStrains.elements);
    const sequenceChange = useSelector((state) => state.genetics.sequenceChange);
    const strainAlreadyPresentError = useSelector((state) => state.genetics.strainAlreadyPresentError);
    const isSavedToDB = useSelector((state) => state.genetics.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

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
    if (hideAlleles) {
        allelesListComponent = (<Alert bsStyle="warning">More than 100 alleles were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of alleles click <a onClick={() => {
            toggleEntityVisibilityCallback("hide_alleles")
        }}>here</a>. If you prefer not to, all the alleles extracted will be associated to this paper in WormBase</Alert>);
    } else {
        allelesListComponent = (
            <MultipleSelect
                linkWB={"https://wormbase.org/species/c_elegans/variation"}
                itemsNameSingular={"allele"}
                itemsNamePlural={"alleles"}
                items={alleles}
                addedItems={addedAlleles}
                addItemFunction={(allele) => dispatch(addAllele(allele))}
                remItemFunction={(allele) => dispatch(removeAllele(allele))}
                searchType={"variation"}
                sampleQuery={"e.g. e1000"}
                defaultExactMatchOnly={true}
                autocompletePlaceholder={"Enter one or more allele name or ID, e.g. e1000 or WBVar00143672, separated by comma, tab, or new line. Then, select from the autocomplete list and click on 'Add selected'"}
            />);
    }
    let strainsListComponent;
    if (hideStrains) {
        strainsListComponent = (<Alert bsStyle="warning">More than 100 strains were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of strains click <a onClick={() => {
            toggleEntityVisibilityCallback("hide_strains")
        }}>here</a>. If you prefer not to, all the strains extracted will be associated to this paper in WormBase</Alert>);
    } else {
        strainsListComponent = (
            <MultipleSelect
                linkWB={"https://wormbase.org/species/c_elegans/strain"}
                itemsNameSingular={"strain"}
                itemsNamePlural={"strains"}
                items={strains}
                addedItems={addedStrains}
                addItemFunction={(strain) => dispatch(addStrain(strain))}
                remItemFunction={(strain) => dispatch(removeStrain(strain))}
                searchType={"strain"}
                sampleQuery={"e.g. CB4856"}
                autocompletePlaceholder={"Enter one or more Strain name or ID, e.g. CB1001 or WBStrain00004222, separated by comma, tab, or new line. Then, select from the autocomplete list and click on 'Add selected'"}
            />);
    }
    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="Here you can find alleles and strains that have been identified in your paper.
                    Please validate the list as for the previous section. You can also submit a new allele name and indicate an allele sequence change."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
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
                                    <ControlLabel>
                                        Enter one allele per line. If possible, enter the gene and allele name followed by strain and species, separated by comma. <br/>
                                        e.g. <i>flu-4(e1004)</i>, CB1004, <i>C.elegans</i>. <br/>
                                        For CRISPR alleles include the knock-in construct, followed by strain and species, separated by comma. <br/>
                                        e.g. <i>hmg-3(bar24[hmg-3::3xHA])</i>, BAT1560, <i>C. elegans</i>
                                    </ControlLabel>
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert new alleles here, one per line"
                                                 value={otherAlleles.map(a => a.name).join("\n")}
                                                 onChange={e => dispatch(setOtherAlleles(e.target.value.split("\n").map((a, index) => {
                                                     return {id: index + 1, name: a}})))}/>
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
                                    <Checkbox checked={sequenceChange.checked}
                                              onClick={() => {
                                                  dispatch(toggleSequenceChange());
                                              }}><strong>Allele sequence change</strong> <OverlayTrigger placement="top"
                                                                                                         overlay={svmTooltip}>
                                        <Image src="tpc_powered.svg" width="80px"/></OverlayTrigger></Checkbox>
                                </div>
                                <div className="col-sm-5">
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info"
                                            onClick={() => {
                                                dispatch(setSequenceChange(true, ''));
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
                                    <ControlLabel>
                                        Enter one strain per line. If possible, enter the strain name followed by genotype followed by species, separated by comma. <br/>
                                        e.g. PMD153, (<i>vhp-1(sa366) II; egIs1 [dat-1p::GFP]</i>), <i>C. elegans</i>
                                    </ControlLabel>
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert new strains here, one per line"
                                                 value={otherStrains.map(a => a.name).join("\n")}
                                                 onChange={e => dispatch(setOtherStrains(e.target.value.split("\n").map((a, index) => {
                                                     return {id: index + 1, name: a}})))}/>
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    let payload = {
                        alleles_list: transformEntitiesIntoAfpString(alleles, ""),
                        allele_seq_change: getCheckboxDBVal(sequenceChange.checked),
                        other_alleles: JSON.stringify(otherAlleles),
                        strains_list: transformEntitiesIntoAfpString(strains, ""),
                        other_strains: JSON.stringify(otherStrains),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.GENETICS));
                }}>Save and continue
                </Button>
            </div>
            <Modal show={strainAlreadyPresentError} onHide={() => dispatch(setStrainAlreadyPresentError(false))}>
                <Modal.Header closeButton>
                    <Modal.Title>One or more strains were replaced by the added strain(s)</Modal.Title>
                </Modal.Header>
                <Modal.Body>Some of the added strains were already present in the final list and were replaced by the added strains</Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => dispatch(setStrainAlreadyPresentError(false))}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Genetics;
