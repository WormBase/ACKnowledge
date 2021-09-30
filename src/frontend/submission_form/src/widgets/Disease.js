import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Form, FormControl, Panel
} from "react-bootstrap";
import InstructionsAlert from "../components/InstructionsAlert";
import {setDisease, toggleDisease} from "../redux/actions/diseaseActions";
import {useDispatch, useSelector} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import {saveWidgetData} from "../redux/actions/widgetActions";
import {WIDGET} from "../constants";

const Disease = () => {
    const dispatch = useDispatch();
    const disease = useSelector((state) => state.disease.disease);
    const isSavedToDB = useSelector((state) => state.disease.isSavedToDB);
    const paperPassword = useSelector((state) => state.paper.paperData.paperPasswd);

    return (
        <div>
            <InstructionsAlert
                alertTitleNotSaved=""
                alertTitleSaved="Well done!"
                alertTextNotSaved="If this paper reports a disease model, please choose one or more that it describes."
                alertTextSaved="The data for this page has been saved, you can modify it any time."
                saved={isSavedToDB}
            />
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Disease model data in the paper</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form>
                        <Checkbox checked={disease.checked} onClick={() => dispatch(toggleDisease())}>
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
                                             value={disease.details}
                                             onClick={() => dispatch(setDisease(true, disease.details))}
                                             onChange={(event) => {
                                                 dispatch(setDisease(true, event.target.value));
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
                        disease: getCheckboxDBVal(disease.checked, disease.details),
                        passwd: paperPassword
                    };
                    dispatch(saveWidgetData(payload, WIDGET.DISEASE));
                }}>Save and continue
                </Button>
            </div>
        </div>
    );
}

export default Disease;