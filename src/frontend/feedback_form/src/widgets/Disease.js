import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Form, FormControl, Panel
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {getDisease, isDiseaseSavedToDB} from "../redux/selectors/diseaseSelectors";
import {setDisease, setIsDiseaseSavedToDB, toggleDisease} from "../redux/actions/diseaseActions";
import {connect} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import {showDataSaved} from "../redux/actions/displayActions";
import {getPaperPassword} from "../redux/selectors/paperSelectors";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {WIDGET} from "../constants";

const Disease = (props) => {

    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="If this paper reports a disease model, please choose one or more that it describes."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={props.isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Disease model data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <Checkbox checked={props.disease.checked} onClick={() => props.toggleDisease()}>
                            <strong>The paper describes an experimental model for a specific human disease (e.g., Parkinson’s disease) by employing at least one of the following:</strong>
                        </Checkbox>
                        <ul>
                            <li><strong>Gene/allele or strain that recapitulates disease phenotype(s) and provides insight into disease pathogenesis. Please provide official names for strains (e.g., CL2006).</strong></li>
                            <li><strong>Transgenic studies with human and/or worm disease relevant gene.</strong></li>
                            <li><strong>Modifiers of a new or previously established disease model (e.g., drugs, herbals, chemicals, etc).</strong></li>
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
                                             value={props.disease.details}
                                             onClick={() => props.setDisease(true, props.disease.details)}
                                             onChange={(event) => {
                                                 props.setDisease(true, event.target.value);
                                             }}
                                />
                            </div>
                        </div>
                    </div>
                </Panel.Body>
            </Panel>
            <div align="right">
                <Button bsStyle="success" onClick={() => {
                    let payload = {
                        disease: getCheckboxDBVal(props.disease.checked, props.disease.details),
                        passwd: props.paperPasswd
                    };
                    props.saveWidgetData(payload, WIDGET.DISEASE);
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    disease: getDisease(state),
    isSavedToDB: isDiseaseSavedToDB(state),
    paperPasswd: getPaperPassword(state)
});

export default connect(mapStateToProps, {setDisease, toggleDisease, showDataSaved, setIsDiseaseSavedToDB, saveWidgetData})(Disease);