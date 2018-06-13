import React from 'react';
import {
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock,
    Panel
} from "react-bootstrap";
import AlertDismissable from "../main_layout/AlertDismissable";
import MultipleSelect from "../page_components/multiple_select";

class Genetics extends React.Component {
    render() {
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
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect itemsNameSingular={"allele"} itemsNamePlural={"alleles"}/>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Allele sequence change</Panel.Title>
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
                            <MultipleSelect itemsNameSingular={"strain"} itemsNamePlural={"strains"}/>
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