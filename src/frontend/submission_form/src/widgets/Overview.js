import React from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Button, Checkbox, ControlLabel, FormControl, Glyphicon, OverlayTrigger,
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
import {saveWidgetData, saveWidgetDataSilently} from "../redux/actions/widgetActions";
import {WIDGET} from "../constants";

const Overview = ({hideGenes, toggleEntityVisibilityCallback}) => {
    const dispatch = useDispatch();
    const genes = useSelector((state) => state.overview.genes.elements);
    const addedGenes = useSelector((state) => state.overview.addedGenes);
    const savedGenes = useSelector((state) => state.overview.savedGenes);
    const species = useSelector((state) => state.overview.species.elements);
    const addedSpecies = useSelector((state) => state.overview.addedSpecies);
    const savedSpecies = useSelector((state) => state.overview.savedSpecies);
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
            Please validate the list of species in your paper in the box below by adding or removing species if required.
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
                savedItems={savedGenes}
                addItemFunction={(gene) => dispatch(addGene(gene))}
                remItemFunction={(gene) => dispatch(removeGene(gene))}
                searchType={"gene"}
                defaultExactMatchOnly={false}
                exactMatchTooltip={'Check this to search for exact gene names only'}
                autocompletePlaceholder={"Type gene names, one per line or separated by commas. For example:\nunc-26\ndpy-5\nWBGene00001234"}
                defaultListView={true}
                defaultShowIds={false}
            />);
    }
    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="In this page you will see genes and species that have been identified in your
                    paper. Please validate the list by adding/removing entries in the identified lists. You can also
                    notify us for gene model updates."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <div style={{marginBottom: '15px', textAlign: 'right'}}>
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    const payload = {
                        gene_list: transformEntitiesIntoAfpString(genes, "WBGene"),
                        gene_model_update: getCheckboxDBVal(geneModel.checked, geneModel.details),
                        species_list: transformEntitiesIntoAfpString(species, ""),
                        other_species: JSON.stringify(otherSpecies),
                        person_id: "two" + person.personId,
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetDataSilently(payload, WIDGET.OVERVIEW));
                }}>
                    <Glyphicon glyph="cloud-upload" style={{marginRight: '6px'}} />
                    Save current progress
                </Button>
            </div>
            <form>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">List of WormBase genes experimentally studied in the paper <OverlayTrigger placement="top" overlay={geneTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        {geneListComponent}
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">New Gene Name</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
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
                                        <Glyphicon glyph="new-window" style={{fontSize: '10px', marginRight: '4px'}}/>
                                        Request New Gene Name
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Gene model updates and gene sequence connection</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
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
                                        <Glyphicon glyph="new-window" style={{fontSize: '10px', marginRight: '4px'}}/>
                                        Report Gene-Sequence
                                    </a>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Checkbox checked={geneModel.checked}
                                              onClick={() => dispatch(toggleGeneModel())}>
                                        <strong>Gene model correction/update</strong></Checkbox>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl type="text" placeholder="Add details here"
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
                        <Panel.Title componentClass="h3">Species in the paper <OverlayTrigger placement="top"
                                                                                              overlay={speciesTooltip}>
                            <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <MultiSelect
                            itemsNamePlural={"species"}
                            items={species}
                            addedItems={addedSpecies}
                            savedItems={savedSpecies}
                            addItemFunction={(species) => dispatch(addSpecies(species))}
                            remItemFunction={(species) => dispatch(removeSpecies(species))}
                            searchType={"species"}
                            defaultExactMatchOnly={true}
                            exactMatchTooltip={'Species searches require exact matches for accuracy'}
                            autocompletePlaceholder={"Type species names, one per line. For example:\nCaenorhabditis elegans\nCaenorhabditis briggsae\nDrosophila melanogaster"}
                        />
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">New species</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <ControlLabel>
                                        Enter new species and species not yet in our system, one per line.
                                    </ControlLabel>
                                    <FormControl componentClass="textarea" rows="5" placeholder="Insert new species here, one per line"
                                                 value={otherSpecies.map(a => a.name).join("\n")}
                                                 onChange={e => dispatch(setOtherSpecies(e.target.value.split("\n").map((a, index) => {
                                                     return {id: index + 1, name: a}})))}/>
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="primary" bsSize="small" onClick={() => {
                    const payload = {
                        gene_list: transformEntitiesIntoAfpString(genes, "WBGene"),
                        gene_model_update: getCheckboxDBVal(geneModel.checked, geneModel.details),
                        species_list: transformEntitiesIntoAfpString(species, ""),
                        other_species: JSON.stringify(otherSpecies),
                        person_id: "two" + person.personId,
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.OVERVIEW));
                }}>Save and go to next section
                </Button>
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

