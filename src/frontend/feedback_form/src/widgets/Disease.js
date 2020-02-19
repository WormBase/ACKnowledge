import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Form, FormControl, Panel
} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {getDisease, isDiseaseSavedToDB} from "../redux/selectors/diseaseSelectors";
import {setDisease, toggleDisease} from "../redux/actions/diseaseActions";
import {connect} from "react-redux";

class Disease extends React.Component {

    setSuccessAlertMessage() {
        this.alertDismissable.setSaved(true);
    }

    render() {

        return (
            <div>
                <InstructionsAlert
                    alertTitleNotSaved=""
                    alertTitleSaved="Well done!"
                    alertTextNotSaved="If this paper reports a disease model, please choose one or more that it describes."
                    alertTextSaved="The data for this page has been saved, you can modify it any time."
                    saved={this.props.isSavedToDB}
                    ref={instance => { this.alertDismissable = instance; }}
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Disease model data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <Checkbox checked={this.props.disease.checked} onClick={() => this.toggle_cb("humDis", "humDis")}>
                                <strong>The paper contains at least one of the following:</strong>
                            </Checkbox>
                            <ul>
                                <li><strong>Gene/allele or strain that recapitulates disease phenotype and is used in
                                    this study to gain insight into human disease pathogenesis.</strong> (Note: we can
                                    only curate strains from the paper if they have official names, eg. CL2006)</li>
                                <li><strong>Transgenic studies with either human (or worm) disease relevant gene</strong></li>
                                <li><strong>Modifiers of a new or previously established disease model (eg., drugs, herbals, chemicals, etc)</strong></li>
                            </ul>
                        </Form>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Additional comments on disease models in the paper
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    Write comments here
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <FormControl componentClass="textarea" multiple
                                                 value={this.props.disease.details}
                                                 onClick={() => this.props.toggleDisease()}
                                                 onChange={(event) => {
                                                     this.props.setDisease(true, event.target.value);
                                                 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                </Panel>
                <div align="right">
                    <Button bsStyle="success" onClick={this.props.callback.bind(this, "disease")}>Save and continue
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    disease: getDisease(state),
    isSavedToDB: isDiseaseSavedToDB(state)
});

export default connect(mapStateToProps, {setDisease, toggleDisease})(Disease);