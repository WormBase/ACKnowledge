import React from 'react';
import {
    Alert,
    Button, ButtonGroup, Checkbox, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Modal, OverlayTrigger,
    Panel, Tooltip
} from "react-bootstrap";
import AlertDismissable from '../main_layout/AlertDismissable'
import MultipleSelect from "../page_components/multiple_select";

class Overview extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: '',
            selectedGenes: ["21ur-5499", "homt-1", "puf-10", "21ur-9312", "21ur-9279", "usp-39", "21ur-3242", "str-55", "21ur-6970", "linc-90", "mir-232", "21ur-12212", "cyn-6", "21ur-7758"],
            wormbaseGenes: ["21ur-10308", "21ur-489", "21ur-3727", "21ur-253", "itsn-1", "pigv-1", "glb-30", "21ur-13589", "21ur-8661", "cdk-7", "fbxa-153", "21ur-14075", "21ur-2943", "21ur-7792", "bath-1", "clec-113", "21ur-10243", "glt-5", "gcy-12", "21ur-6598", "aagr-4", "ima-3", "21ur-2314", "21ur-11572", "cyn-17", "21ur-14681", "emb-25", "21ur-11688", "cox-5B", "fbxa-43", "21ur-12333", "srh-149", "21ur-10372", "21ur-4530", "21ur-13058", "srz-5", "lron-12", "21ur-6552", "dlc-6", "21ur-2236", "21ur-61", "snpc-1.3", "skpo-3", "21ur-3289", "21ur-14962", "21ur-5950", "fbxb-31", "ttr-57", "21ur-808", "chn-1", "sup-35", "rpl-5", "21ur-5829", "21ur-8171", "21ur-12738", "ptrn-1", "21ur-15038", "21ur-14955", "21ur-3929", "fbxc-23", "21ur-2400", "str-101", "21ur-14319", "bath-15", "nduo-3", "let-242", "21ur-13778", "21ur-5985", "tag-293", "21ur-9542", "21ur-11792", "21ur-9478", "21ur-15045", "fbxb-8", "21ur-9885", "21ur-7105", "cyn-1", "21ur-4518", "21ur-9581", "cnc-1", "21ur-2638", "bicd-1", "tbc-20", "21ur-10443", "21ur-2521", "21ur-933"],
            selectedSpecies: ["species1", "species2", "species3"],
            wormbaseSpecies: ["species4", "species5", "species3"],
            cb_gmcorr: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.check_genemodel_cb = this.check_genemodel_cb.bind(this);
        this.toggle_cb_gmcorr = this.toggle_cb_gmcorr.bind(this);
    }

    getValidationState() {
        const length = this.state.value.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
        return null;
    }

    check_genemodel_cb() {
        this.setState({cb_gmcorr: true});
    }

    toggle_cb_gmcorr() {
        this.setState({cb_gmcorr: !this.state.cb_gmcorr});
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    render() {
        const geneTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of genes in your paper in the box below by adding or removing genes if required.
            </Tooltip>
        );

        const speciesTooltip = (
            <Tooltip id="tooltip">
                Please validate the list of species in your paper in the box below by adding or removing species if required.
            </Tooltip>
        );

        return (
            <div>
                <AlertDismissable title="Let's get started!" text="In this page you will see genes and species that have
                been identified in your paper. Please validate the list by adding/removing entries in the identified
                genes list. You can also notify us for gene model updates." bsStyle="info"
                                  show={!this.props.saved}/>
                <AlertDismissable title="well done!" text="The data for this page has been saved, you can modify it any
                time." bsStyle="success" show={this.props.saved}/>
                <form>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Genes in the paper <OverlayTrigger placement="top"
                                                                                                overlay={geneTooltip}>
                                <Glyphicon glyph="question-sign"/></OverlayTrigger></Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <MultipleSelect
                                itemsNameSingular={"gene"}
                                itemsNamePlural={"genes"}
                                selectedItems={this.state.selectedGenes}
                                availableItems={this.state.wormbaseGenes}/>
                        </Panel.Body>
                    </Panel>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Gene model updates</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div className="container-fluid">
                                <div>
                                    <Checkbox checked={this.state.cb_gmcorr}
                                              onClick={this.toggle_cb_gmcorr}>
                                        <strong>Gene model correction/update</strong></Checkbox>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormControl type="text" placeholder="Add details here" onClick={this.check_genemodel_cb}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">&nbsp;</div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Button bsStyle="info" onClick={this.check_genemodel_cb}>
                                            Request New Gene Name/Report Gene-Sequence
                                        </Button>
                                    </div>
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
                                selectedItems={this.state.selectedSpecies}
                                availableItems={this.state.wormbaseSpecies}
                            />
                        </Panel.Body>
                    </Panel>
                </form>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "overview")}>Save and continue
                    </Button>
                    <MyLargeModal show={this.props.showPopup} onHide={this.props.popupCallback.bind(this)} />
                </div>
            </div>
        );
    }
}

class MyLargeModal extends React.Component {

    constructor(props, context) {
        super(props, context);

        let show = "";
        if (props["show"] !== undefined) {
            show = props["show"];
        }
        this.state = {
            show: show
        };
    }


    render() {
        if (this.state.show) {
            return (
                <Modal
                    {...this.props}
                    bsSize="large"
                    aria-labelledby="contained-modal-title-sm">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">Welcome</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            Thank you for filling out this form. By doing so, you are helping us incorporate your data into WormBase in a timely fashion.
                        </p>
                        <p>
                            Please review the information presented in each page of the form. If needed, you may revise what is there or add more information.
                        </p>
                        <p>
                            To save the data entered in each page and move to the next, click 'Save and continue'. You can return to each page any time. When you are finished, please click on 'Finish and Submit' on the last page.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>Close</Button>
                    </Modal.Footer>
                </Modal>
            );
        } else {
            return ("");
        }
    }
}

export default Overview;