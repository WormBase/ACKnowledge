import React from 'react';
import {
    Alert,
    Button, Checkbox, FormControl, Glyphicon, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import MultipleSelect from "../components/multiselect/MultiSelect";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {WIDGET} from "../main_layout/menu_and_widgets/constants"
import {
    addGene,
    addSpecies,
    removeGene,
    removeSpecies,
    setGeneModel,
    toggleGeneModel
} from "../redux/actions/overviewActions";
import {getGeneModel, getGenes, getSpecies, isOverviewSavedToDB} from "../redux/selectors/overviewSelectors";
import {connect} from "react-redux";

class Overview extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            show_fetch_data_error: false,
        };
    }

    setSuccessAlertMessage = () => this.alertDismissable.setSaved(true);

    render() {
        const geneTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of genes in your paper in the box below by adding or removing genes if required. Only genes mentioned 2 or more times are extracted
            </Tooltip>
        );

        const speciesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of species in your paper in the box below by adding or removing species if required. Only species mentioned 10 or more times are extracted
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
                    ref={instance => { this.alertDismissable = instance; }}
                />
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">List of WormBase genes identified in the paper <OverlayTrigger placement="top" overlay={geneTooltip}>
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
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, WIDGET.OVERVIEW)}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    geneModel: getGeneModel(state),
    isSavedToDB: isOverviewSavedToDB(state)
});

export default connect(mapStateToProps, {addGene, removeGene, addSpecies, removeSpecies, setGeneModel, toggleGeneModel})(Overview);