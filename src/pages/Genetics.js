import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";
import MultipleSelect from "../page_components/multiple_select";

class Genetics extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedAlleles: props["selectedAlleles"],
            selectedStrains: props["selectedStrains"],
            cb_allele: props["alleleSeqChange"]
        };

        this.check_cb_allele = this.check_cb_allele.bind(this);
        this.toggle_cb_allele = this.toggle_cb_allele.bind(this);
    }

    check_cb_allele() {
        this.setState({cb_allele: true});
        this.props.alleleSeqChangeCallback(true);
    }

    toggle_cb_allele() {
        let newVal = !this.state.cb_allele;
        this.setState({cb_allele: newVal});
        this.props.alleleSeqChangeCallback(newVal);
    }

    setSelectedAlleles(allelelist) {
        this.alleleSelect.setSelectedItems(allelelist);
    }

    setSelecedStrains(strains) {
        this.strainSelect.setSelectedItems(strains);
    }

    setAlleleSeqChange(){}

    render() {
        const allelesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of alleles in your paper in the box below by adding or removing alleles if required.
            </Tooltip>
        );

        const strainsTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of strains in your paper in the box below by adding or removing strains if required.
            </Tooltip>
        );
        return (
            <div>
                <AlertDismissable title="" text="Here you can find alleles and strains that have
                been identified in your paper. Please validate the list as for the previous section. You can also
                indicate an allele sequence change and submit a new allele name." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Alleles in the paper <OverlayTrigger placement="top" overlay={allelesTooltip}>
                                <Glyphicon glyph="question-sign"/>
                            </OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"allele"}
                                itemsNamePlural={"alleles"}
                                selectedItems={this.state.selectedAlleles}
                                ref={instance => { this.alleleSelect = instance; }}
                                selectedItemsCallback={this.props.selectedAllelesCallback}
                            />
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
                                        <Checkbox checked={this.state.cb_allele}
                                                  onClick={this.toggle_cb_allele}><strong>Allele sequence change</strong></Checkbox>
                                    </div>
                                    <div className="col-sm-5">
                                        <Button bsStyle="info"
                                                href={"https://wormbase.org/submissions/allele_sequence.cgi"} target="_blank"
                                                onClick={this.check_cb_allele}>
                                            Add details in online form
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Strains in the paper <OverlayTrigger placement="top" overlay={strainsTooltip}>
                                    <Glyphicon glyph="question-sign"/>
                                </OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"strain"}
                                itemsNamePlural={"strains"}
                                selectedItems={this.state.selectedStrains}
                                ref={instance => { this.strainSelect = instance; }}
                                selectedItemsCallback={this.props.selectedStrainsCallback}
                            />
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "genetics")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

export default Genetics;