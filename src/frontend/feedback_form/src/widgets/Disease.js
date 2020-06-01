import React from 'react';
import Button from "react-bootstrap/es/Button";
import {
    Checkbox, Form, FormControl, Panel
} from "react-bootstrap";
import InstructionsAlert from "../main_layout/InstructionsAlert";
import {getDisease, isDiseaseSavedToDB} from "../redux/selectors/diseaseSelectors";
import {setDisease, setIsDiseaseSavedToDB, toggleDisease} from "../redux/actions/diseaseActions";
import {connect} from "react-redux";
import {getCheckboxDBVal} from "../AFPValues";
import {setLoading, showDataSaved, unsetLoading} from "../redux/actions/displayActions";
import {DataManager} from "../lib/DataManager";

class Disease extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            dataManager: new DataManager()
        };
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
                />
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">Disease model data in the paper</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <Form>
                            <Checkbox checked={this.props.disease.checked} onClick={() => this.props.toggleDisease()}>
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
                                                 value={this.props.disease.details}
                                                 onClick={() => this.props.setDisease(true, this.props.disease.details)}
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
                    <Button bsStyle="success" onClick={() => {
                        let payload = {
                            disease: getCheckboxDBVal(this.props.disease.checked, this.props.disease.details),
                        };
                        this.props.setLoading();
                        this.state.dataManager.postWidgetData(payload)
                            .then(() => {
                                this.props.setIsDiseaseSavedToDB();
                                this.props.showDataSaved(true, false);
                            })
                            .catch((error) => {
                                this.props.showDataSaved(false, false);
                            }).finally(() => this.props.unsetLoading());
                        }}>Save and continue
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

export default connect(mapStateToProps, {setDisease, toggleDisease, showDataSaved, setIsDiseaseSavedToDB, setLoading, unsetLoading})(Disease);