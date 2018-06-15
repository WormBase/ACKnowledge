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
            selectedAlleles: ["allele1", "allele2", "allele3"],
            wormbaseAlleles: ["allele4", "allele5", "allele3"],
            selectedStrains: ["strain1", "strain2", "strain3"],
            wormbaseStrains: ["strain4", "strain5", "strain3"]
        };
    }

    render() {
        const allelesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of genes in your paper in the box below by adding or removing genes if required.
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
                            <Panel.Title componentClass="h3">Alleles in the paper</Panel.Title>
                            <OverlayTrigger placement="top" overlay={allelesTooltip}>
                                <Glyphicon glyph="question-sign"/>
                            </OverlayTrigger>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"allele"}
                                itemsNamePlural={"alleles"}
                                selectedItems={this.state.selectedAlleles}
                                availableItems={this.state.wormbaseAlleles}
                            />
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Allele sequence change</Panel.Title>
                            <OverlayTrigger placement="top" overlay={strainsTooltip}>
                                <Glyphicon glyph="question-sign"/>
                            </OverlayTrigger>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div>
                                    <Checkbox><strong>Allele sequence change</strong></Checkbox>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button bsStyle="info" href={"https://wormbase.org/submissions/allele_sequence.cgi"}>
                                            Provide allele-sequence info
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Strains in the paper</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"strain"}
                                itemsNamePlural={"strains"}
                                selectedItems={this.state.selectedStrains}
                                availableItems={this.state.wormbaseStrains}
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