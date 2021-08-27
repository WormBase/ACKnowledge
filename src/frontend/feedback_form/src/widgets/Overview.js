import React from 'react';
import {
    Alert,
    Button, Checkbox, FormControl, Glyphicon, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {
    addGene,
    addSpecies,
    removeGene,
    removeSpecies,
    setGeneModel, setIsOverviewSavedToDB,
    toggleGeneModel
} from "../redux/actions/overviewActions";
import {
    getAddedGenes, getAddedSpecies,
    getGeneModel,
    getGenes,
    getSpecies,
    isOverviewSavedToDB
} from "../redux/selectors/overviewSelectors";
import {connect} from "react-redux";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {WIDGET} from "../constants";

const Overview = (props) => {
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
    if (props.hideGenes) {
        geneListComponent = (<Alert bsStyle="warning">More than 100 genes were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of genes click <a onClick={() => {
            props.toggleEntityVisibilityCallback("hide_genes")
        }}>here</a>. If you prefer not to, all the genes extracted will be associated to this paper in WormBase</Alert>);
    } else {
        geneListComponent = (
            <MultipleSelect
                linkWB={"https://wormbase.org/species/c_elegans/gene"}
                itemsNameSingular={"gene"}
                itemsNamePlural={"genes"}
                items={props.genes}
                addedItems={props.addedGenes}
                addItemFunction={(gene) => props.addGene(gene)}
                remItemFunction={(gene) => props.removeGene(gene)}
                searchType={"gene"}
                sampleQuery={"e.g. dbl-1"}
                defaultExactMatchOnly={true}
                exactMatchTooltip={'Uncheck this option to see genes from more species'}
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
                saved={props.isSavedToDB}
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
                                        props.setGeneModel();
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
                                        props.setGeneModel();
                                        window.open("http://www.wormbase.org/submissions/gene_name.cgi", "_blank");
                                    }}>
                                        Report Gene-Sequence
                                    </Button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Checkbox checked={props.geneModel.checked}
                                              onClick={() => props.toggleGeneModel()}>
                                        <strong>Gene model correction/update</strong></Checkbox>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl type="text" placeholder="Add details here"
                                                 value={props.geneModel.details}
                                                 onClick={() => props.setGeneModel(true, props.geneModel.details)}
                                                 onChange={(event) => {
                                                     props.setGeneModel(true, event.target.value)
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
                            items={props.species}
                            addedItems={props.addedSpecies}
                            addItemFunction={(species) => props.addSpecies(species)}
                            remItemFunction={(species) => props.removeSpecies(species)}
                            searchType={"species"}
                            sampleQuery={"e.g. Caenorhabditis"}
                            defaultExactMatchOnly={true}
                            hideListIDs
                        />
                    </Panel.Body>
                </Panel>
            </form>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    const payload = {
                        gene_list: transformEntitiesIntoAfpString(props.genes, "WBGene"),
                        gene_model_update: getCheckboxDBVal(props.geneModel.checked, props.geneModel.details),
                        species_list: transformEntitiesIntoAfpString(props.species, ""),
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.OVERVIEW);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    genes: getGenes(state).elements,
    geneModel: getGeneModel(state),
    species: getSpecies(state).elements,
    isSavedToDB: isOverviewSavedToDB(state),
    paperPasswd: getPaperPassword(state),
    addedGenes: getAddedGenes(state),
    addedSpecies: getAddedSpecies(state)
});

export default connect(mapStateToProps, {addGene, removeGene, addSpecies, removeSpecies, setGeneModel, toggleGeneModel,
    setIsOverviewSavedToDB, saveWidgetData})(Overview);
