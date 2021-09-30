import React from 'react';
import {
    Alert,
    Button, Checkbox, FormControl, Glyphicon, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../components/InstructionsAlert";
import {
    addGene,
    addSpecies,
    removeGene,
    removeSpecies,
    setGeneModel,
    toggleGeneModel
} from "../redux/actions/overviewActions";
import {connect, useDispatch, useSelector} from "react-redux";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {WIDGET} from "../constants";

const Overview = ({hideGenes, toggleEntityVisibilityCallback}) => {
    const dispatch = useDispatch();
    const genes = useSelector((state) => state.overview.genes.elements);
    const addedGenes = useSelector((state) => state.overview.addedGenes);
    const species = useSelector((state) => state.overview.species.elements);
    const addedSpecies = useSelector((state) => state.overview.addedSpecies);
    const geneModel = useSelector((state) => state.overview.geneModel);
    const isSavedToDB = useSelector((state) => state.overview.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

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
            <MultipleSelect
                linkWB={"https://wormbase.org/species/c_elegans/gene"}
                itemsNameSingular={"gene"}
                itemsNamePlural={"genes"}
                items={genes}
                addedItems={addedGenes}
                addItemFunction={(gene) => dispatch(addGene(gene))}
                remItemFunction={(gene) => dispatch(removeGene(gene))}
                searchType={"gene"}
                sampleQuery={"e.g. dbl-1"}
                defaultExactMatchOnly={true}
                exactMatchTooltip={'Uncheck this option to see genes from more species'}
                autocompletePlaceholder={"Enter one or more gene name or ID, e.g. unc-26 or WBGene00006763, separated by comma, tab, or new line. Then, select from the autocomplete list and click on 'Add selected'"}
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
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        dispatch(setGeneModel());
                                        window.open("http://www.wormbase.org/submissions/gene_name.cgi", "_blank");
                                    }}>
                                        Request New Gene Name
                                    </Button>
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
                                    <Button bsClass="btn btn-info wrap-button" bsStyle="info" onClick={() => {
                                        dispatch(setGeneModel());
                                        window.open("http://www.wormbase.org/submissions/gene_name.cgi", "_blank");
                                    }}>
                                        Report Gene-Sequence
                                    </Button>
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
                        <MultipleSelect
                            itemsNameSingular={"species"}
                            itemsNamePlural={"species"}
                            items={species}
                            addedItems={addedSpecies}
                            addItemFunction={(species) => dispatch(addSpecies(species))}
                            remItemFunction={(species) => dispatch(removeSpecies(species))}
                            searchType={"species"}
                            sampleQuery={"e.g. Caenorhabditis"}
                            defaultExactMatchOnly={false}
                            autocompletePlaceholder={"Enter one or more species name, e.g. Caenorhabditis elegans, separated by comma, tab, or new line. Then, select from the autocomplete list and click on 'Add selected'"}
                            hideListIDs
                        />
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    const payload = {
                        gene_list: transformEntitiesIntoAfpString(genes, "WBGene"),
                        gene_model_update: getCheckboxDBVal(geneModel.checked, geneModel.details),
                        species_list: transformEntitiesIntoAfpString(species, ""),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.OVERVIEW));
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

export default Overview;

