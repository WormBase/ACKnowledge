import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Button, Checkbox, Collapse, ControlLabel, FormControl, Glyphicon, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultiSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../components/InstructionsAlert";
import {
    addGene,
    addSpecies,
    removeGene,
    removeSpecies,
    setGeneModel, setOtherSpecies,
    toggleGeneModel
} from "../redux/actions/overviewActions";
import {useDispatch, useSelector} from "react-redux";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {WIDGET} from "../constants";
import SaveButton from "../components/SaveButton";

const Overview = ({hideGenes, toggleEntityVisibilityCallback}) => {
    const dispatch = useDispatch();
    const [showOtherGenes, setShowOtherGenes] = useState(false);
    const [showOtherSpecies, setShowOtherSpecies] = useState(false);
    const genes = useSelector((state) => state.overview.genes.elements);
    const addedGenes = useSelector((state) => state.overview.addedGenes);
    const savedGenes = useSelector((state) => state.overview.savedGenes);
    const tfpGenes = useSelector((state) => state.overview.tfpGenes);
    const species = useSelector((state) => state.overview.species.elements);
    const addedSpecies = useSelector((state) => state.overview.addedSpecies);
    const savedSpecies = useSelector((state) => state.overview.savedSpecies);
    const tfpSpecies = useSelector((state) => state.overview.tfpSpecies);
    const geneModel = useSelector((state) => state.overview.geneModel);
    const isSavedToDB = useSelector((state) => state.overview.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);
    const person = useSelector((state) => state.person.person);
    const otherSpecies = useSelector((state) => state.overview.otherSpecies.elements);

    const geneTooltip = (
        <Tooltip id="tooltip">
            Please validate the list of genes experimentally studied in the paper in the box below by adding or removing genes if required.
        </Tooltip>
    );

    const speciesTooltip = (
        <Tooltip id="tooltip">
            Please validate the list of species experimentally studied in your paper in the box below by adding or removing species if required.
        </Tooltip>
    );
    let geneListComponent;
    if (hideGenes) {
        geneListComponent = (<Alert bsStyle="warning">More than 100 genes were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of genes click <a onClick={() => {
            toggleEntityVisibilityCallback("hide_genes")
        }}>here</a>. If you prefer not to, all the genes extracted will be associated to this paper in WormBase</Alert>);
    } else {
        geneListComponent = (
            <MultiSelect
                linkWB={"https://wormbase.org/species/c_elegans/gene"}
                itemsNamePlural={"genes"}
                items={genes}
                addedItems={addedGenes}
                savedItems={tfpGenes}  // Use tfp_ data as the reference for comparison
                addItemFunction={(gene) => dispatch(addGene(gene))}
                remItemFunction={(gene) => dispatch(removeGene(gene))}
                searchType={"gene"}
                defaultExactMatchOnly={false}
                exactMatchTooltip={'Check this to search for exact gene names only'}
                autocompletePlaceholder={"Type gene names, one per line or separated by commas. For example:\nunc-26\ndpy-5\nWBGene00001234"}
            />);
    }
    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="In this page you will see genes and species that have been experimentally studied in your
                    paper. Please validate the list by adding/removing entries. You can also
                    notify us for gene model updates."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <form>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">List of WormBase genes experimentally studied in the paper <OverlayTrigger placement="top" overlay={geneTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        {geneListComponent}
                        
                        {/* New gene name section integrated into main panel */}
                        <div style={{marginTop: '15px'}}>
                            <Button
                                onClick={() => setShowOtherGenes(!showOtherGenes)}
                                aria-controls="other-genes-collapse"
                                aria-expanded={showOtherGenes}
                                bsStyle="link"
                                style={{
                                    padding: '0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    color: '#337ab7'
                                }}
                            >
                                <Glyphicon glyph={showOtherGenes ? "chevron-down" : "chevron-right"} style={{marginRight: '6px'}} />
                                Can't find a gene? Request a new gene name
                            </Button>
                            <Collapse in={showOtherGenes}>
                                <div id="other-genes-collapse" style={{marginTop: '10px'}}>
                                    <Alert bsStyle="info" style={{fontSize: '13px'}}>
                                        <strong>Note:</strong> If a gene you're looking for doesn't appear when using the "Add" button above
                                        (because it's newly discovered and not yet in WormBase), you can request a new gene name using the link below.
                                    </Alert>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <OverlayTrigger overlay={<Tooltip id="tooltip">Contact the nomenclature committee if you don't have an official gene name assignment or wish to report or update a gene-sequence connection</Tooltip>}>
                                                    <a
                                                        href="http://www.wormbase.org/submissions/gene_name.cgi"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: '13px',
                                                            color: '#0066cc',
                                                            textDecoration: 'none',
                                                            borderBottom: '1px solid #0066cc',
                                                            fontWeight: '500'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.color = '#004499';
                                                            e.target.style.borderBottomColor = '#004499';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.color = '#0066cc';
                                                            e.target.style.borderBottomColor = '#0066cc';
                                                        }}
                                                        onClick={() => dispatch(setGeneModel())}
                                                    >
                                                        Request new gene name or report gene-sequence connections <Glyphicon glyph="new-window" style={{fontSize: '10px'}}/>
                                                    </a>
                                                </OverlayTrigger>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Gene model updates <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">Please alert us to any corrections or updates to existing gene models.</Tooltip>}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <Checkbox checked={geneModel.checked}
                                              onClick={() => dispatch(toggleGeneModel())}>
                                        <strong>Gene model correction/update</strong></Checkbox>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl type="text" placeholder="E.g.: We found a new variant of Y71H2B.8 with a different splice site."
                                                 value={geneModel.details}
                                                 onClick={() => dispatch(setGeneModel(true, geneModel.details))}
                                                 onChange={(event) => {
                                                     dispatch(setGeneModel(true, event.target.value))
                                                 }}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">&nbsp;</div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">List of species experimentally studied in the paper <OverlayTrigger placement="top"
                                                                                              overlay={speciesTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <MultiSelect
                            itemsNamePlural={"species"}
                            items={species}
                            addedItems={addedSpecies}
                            savedItems={tfpSpecies}  // Use tfp_ data as the reference for comparison
                            addItemFunction={(species) => dispatch(addSpecies(species))}
                            remItemFunction={(species) => dispatch(removeSpecies(species))}
                            searchType={"species"}
                            defaultExactMatchOnly={false}
                            exactMatchTooltip={'Species searches require exact matches for accuracy'}
                            autocompletePlaceholder={"Type species names, one per line. For example:\nCaenorhabditis elegans\nCaenorhabditis briggsae\nDrosophila melanogaster"}
                            showIdToggle={false}
                        />
                        
                        {/* New species section integrated into main panel */}
                        <div style={{marginTop: '15px'}}>
                            <Button
                                onClick={() => setShowOtherSpecies(!showOtherSpecies)}
                                aria-controls="other-species-collapse"
                                aria-expanded={showOtherSpecies}
                                bsStyle="link"
                                style={{
                                    padding: '0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    color: '#337ab7'
                                }}
                            >
                                <Glyphicon glyph={showOtherSpecies ? "chevron-down" : "chevron-right"} style={{marginRight: '6px'}} />
                                Can't find a species? Add new species not yet in WormBase
                            </Button>
                            <Collapse in={showOtherSpecies}>
                                <div id="other-species-collapse" style={{marginTop: '10px'}}>
                                    <Alert bsStyle="info" style={{fontSize: '13px'}}>
                                        <strong>Note:</strong> If a species you're looking for doesn't appear when using the "Add" button above
                                        (because it's new and not yet in WormBase), you can enter it manually below.
                                        This is for newly studied species that haven't been curated into WormBase yet.
                                    </Alert>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <ControlLabel>
                                                    Enter new species and species not yet in our system, one per line.
                                                </ControlLabel>
                                                <FormControl componentClass="textarea" rows="5" placeholder="Enter new species not yet in WormBase here, one per line"
                                                             value={otherSpecies.map(a => a.name).join("\n")}
                                                             onChange={e => dispatch(setOtherSpecies(e.target.value.split("\n").map((a, index) => {
                                                                 return {id: index + 1, name: a}})))}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <SaveButton
                    payload={{
                        gene_list: transformEntitiesIntoAfpString(genes, "WBGene"),
                        gene_model_update: getCheckboxDBVal(geneModel.checked, geneModel.details),
                        species_list: transformEntitiesIntoAfpString(species, ""),
                        other_species: JSON.stringify(otherSpecies),
                        person_id: "two" + person.personId,
                        passwd: paperPassword
                    }}
                    widgetName={WIDGET.OVERVIEW}
                    buttonText="Save and go to next section"
                />
            </div>
        </div>
    );
}

Overview.propTypes = {
    hideGenes: PropTypes.bool,
    toggleEntityVisibilityCallback: PropTypes.func.isRequired
}

Overview.defaultProps = {
    hideGenes: false
}

export default Overview;

