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
import {getGeneModel, getGenes, getSpecies, isOverviewSavedToDB} from "../redux/selectors/overviewSelectors";
import {connect} from "react-redux";
import {getCheckboxDBVal, transformEntitiesIntoAfpString} from "../AFPValues";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {WIDGET} from "../constants";

class Overview extends React.Component {

    render() {
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
        if (this.props.hideGenes) {
            geneListComponent = (<Alert bsStyle="warning">More than 100 genes were extracted from the paper and they were omitted from the Author First Pass interface. If you would like to validate the list of genes click <a onClick={() => {
                this.props.toggleEntityVisibilityCallback("hide_genes")
            }}>here</a>. If you prefer not to, all the genes extracted will be associated to this paper in WormBase</Alert>);
        } else {
            geneListComponent = (
            <MultipleSelect
                itemsNameSingular={"gene"}
                itemsNamePlural={"genes"}
                dataReaderFunction={getGenes}
                addItemFunction={(gene) => this.props.addGene(gene)}
                remItemFunction={(gene) => this.props.removeGene(gene)}
                searchType={"gene"}
                sampleQuery={"e.g. dbl-1"}
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
                    saved={this.props.isSavedToDB}
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
                                            this.props.setGeneModel();
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
                                            this.props.setGeneModel();
                                            window.open("http://www.wormbase.org/submissions/gene_name.cgi", "_blank");
                                        }}>
                                            Report Gene-Sequence
                                        </Button>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Checkbox checked={this.props.geneModel.checked}
                                                  onClick={() => this.props.toggleGeneModel()}>
                                            <strong>Gene model correction/update</strong></Checkbox>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormControl type="text" placeholder="Add details here"
                                                     value={this.props.geneModel.details}
                                                     onClick={() => this.props.setGeneModel(true, '')}
                                                     onChange={(event) => {
                                                         this.props.setGeneModel(true, event.target.value)
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
                                dataReaderFunction={getSpecies}
                                addItemFunction={(species) => this.props.addSpecies(species)}
                                remItemFunction={(species) => this.props.removeSpecies(species)}
                                searchType={"species"}
                                sampleQuery={"e.g. Caenorhabditis"}
                            />
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={() => {
                        const payload = {
                            gene_list: transformEntitiesIntoAfpString(this.props.genes, "WBGene"),
                            gene_model_update: getCheckboxDBVal(this.props.geneModel.checked, this.props.geneModel.details),
                            species_list: transformEntitiesIntoAfpString(this.props.species, ""),
                            passwd: this.props.paperPasswd
                        };
                        this.props.saveWidgetData(payload, WIDGET.OVERVIEW);
                    }}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    genes: getGenes(state).elements,
    geneModel: getGeneModel(state),
    species: getSpecies(state).elements,
    isSavedToDB: isOverviewSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {addGene, removeGene, addSpecies, removeSpecies, setGeneModel, toggleGeneModel,
    setIsOverviewSavedToDB, saveWidgetData})(Overview);