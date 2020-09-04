import React, { Component } from 'react';
import queryString from 'query-string';
import {connect} from "react-redux";
import {
    setAlleles, setIsGeneticsSavedToDB,
    setOtherAlleles,
    setOtherStrains,
    setSequenceChange,
    setStrains
} from "../redux/actions/geneticsActions";
import {setGeneModel, setGenes, setIsOverviewSavedToDB, setSpecies} from "../redux/actions/overviewActions";
import {
    setIsReagentSavedToDB,
    setNewAntibodies,
    setOtherAntibodies,
    setOtherTransgenes, setTransgenes
} from "../redux/actions/reagentActions";
import {
    setAdditionalExpr, setExpression,
    setIsExpressionSavedToDB,
    setRnaseq, setSiteOfAction,
    setTimeOfAction
} from "../redux/actions/expressionActions";
import {
    setGeneticInteractions,
    setIsInteractionsSavedToDB,
    setPhysicalInteractions,
    setRegulatoryInteractions
} from "../redux/actions/interactionsActions";
import {
    setAllelePhenotype,
    setChemicalPhenotype, setEnvironmentalPhenotype,
    setEnzymaticActivity,
    setIsPhenotypesSavedToDB, setOthergenefunc, setOverexprPhenotype,
    setRnaiPhenotype,
    toggleAllelePhenotype
} from "../redux/actions/phenotypesActions";
import {setComments, setIsCommentsSavedToDB} from "../redux/actions/commentsActions";
import {showDataFetchError} from "../redux/actions/displayActions";
import {setPerson} from "../redux/actions/personActions";
import {setDisease, setIsDiseaseSavedToDB} from "../redux/actions/diseaseActions";
import MenuAndWidgets from "./MenuAndWidgets";
import {DataManager} from "../lib/DataManager";
import withRouter from "react-router/withRouter";

class Main extends Component {

    constructor(props) {
        super(props);
        let parameters = queryString.parse(this.props.location.search);
        this.state = {
            dataManager: new DataManager(process.env.REACT_APP_API_READ_ENDPOINT + '&paper=' +
                parameters.paper + '&passwd=' + parameters.passwd, process.env.REACT_APP_API_DB_READ_ENDPOINT,
                process.env.REACT_APP_API_DB_WRITE_ENDPOINT, parameters.passwd)
        }
    }

    componentDidMount() {
        this.state.dataManager.getPaperData()
            .then(() => {
                console.log("Data successfully loaded from WB API (postgres)");
                // overview
                this.props.setGenes(this.state.dataManager.genesList.entities(),
                    this.state.dataManager.genesList.prevSaved());
                this.props.setSpecies(this.state.dataManager.speciesList.entities(),
                    this.state.dataManager.speciesList.prevSaved());
                this.props.setGeneModel(this.state.dataManager.structCorrcb.isChecked(),
                    this.state.dataManager.structCorrcb.details());
                if (this.state.dataManager.genesList.prevSaved() && this.state.dataManager.speciesList.prevSaved()) {
                    this.props.setIsOverviewSavedToDB();
                }

                // genetics
                this.props.setAlleles(this.state.dataManager.variationsList.entities(),
                    this.state.dataManager.variationsList.prevSaved());
                this.props.setStrains(this.state.dataManager.strainsList.entities(),
                    this.state.dataManager.strainsList.prevSaved());
                this.props.setSequenceChange(this.state.dataManager.seqChange.isChecked(),
                    this.state.dataManager.seqChange.details());
                this.props.setOtherAlleles(this.state.dataManager.otherVariations.entities(),
                    this.state.dataManager.otherVariations.prevSaved());
                this.props.setOtherStrains(this.state.dataManager.otherStrains.entities(),
                    this.state.dataManager.otherStrains.prevSaved());
                if (this.state.dataManager.variationsList.prevSaved() && this.state.dataManager.strainsList.prevSaved()) {
                    this.props.setIsGeneticsSavedToDB();
                }

                // reagent
                this.props.setTransgenes(this.state.dataManager.transgenesList.entities());
                this.props.setOtherTransgenes(this.state.dataManager.otherTransgenesList.entities());
                this.props.setOtherAntibodies(this.state.dataManager.otherAntibodiesList.entities());
                this.props.setNewAntibodies(this.state.dataManager.newAntibodies.isChecked(),
                    this.state.dataManager.newAntibodies.details());
                if (this.state.dataManager.transgenesList.prevSaved() &&
                    this.state.dataManager.otherTransgenesList.prevSaved() &&
                    this.state.dataManager.otherAntibodiesList.prevSaved()) {
                    this.props.setIsReagentSavedToDB();
                }

                // expression
                this.props.setExpression(this.state.dataManager.expression.isChecked(),
                    this.state.dataManager.expression.details());
                this.props.setSiteOfAction(this.state.dataManager.siteOfAction.isChecked(),
                    this.state.dataManager.siteOfAction.details());
                this.props.setTimeOfAction(this.state.dataManager.timeOfAction.isChecked(),
                    this.state.dataManager.timeOfAction.details());
                this.props.setRnaseq(this.state.dataManager.rnaSeq.isChecked(),
                    this.state.dataManager.rnaSeq.details());
                this.props.setAdditionalExpr(this.state.dataManager.additionalExpr.details());
                if (this.state.dataManager.expression.prevSaved() && this.state.dataManager.siteOfAction.prevSaved() &&
                    this.state.dataManager.timeOfAction.prevSaved() && this.state.dataManager.rnaSeq.prevSaved() &&
                    this.state.dataManager.additionalExpr.prevSaved()) {
                    this.props.setIsExpressionSavedToDB();
                }

                // interactions
                this.props.setGeneticInteractions(this.state.dataManager.geneint.isChecked(), this.state.dataManager.geneint.details());
                this.props.setPhysicalInteractions(this.state.dataManager.geneprod.isChecked(), this.state.dataManager.geneprod.details());
                this.props.setRegulatoryInteractions(this.state.dataManager.genereg.isChecked(), this.state.dataManager.genereg.details());
                if (this.state.dataManager.geneint.prevSaved() && this.state.dataManager.geneprod.prevSaved() &&
                    this.state.dataManager.genereg.prevSaved()) {
                    this.props.setIsInteractionsSavedToDB();
                }

                // phenotypes
                this.props.setAllelePhenotype(this.state.dataManager.newmutant.isChecked(), this.state.dataManager.newmutant.details());
                this.props.setRnaiPhenotype(this.state.dataManager.rnai.isChecked(), this.state.dataManager.rnai.details());
                this.props.setOverexprPhenotype(this.state.dataManager.overexpr.isChecked(), this.state.dataManager.overexpr.details());
                this.props.setChemicalPhenotype(this.state.dataManager.chemphen.isChecked(), this.state.dataManager.chemphen.details());
                this.props.setEnvironmentalPhenotype(this.state.dataManager.envpheno.isChecked(), this.state.dataManager.envpheno.details());
                this.props.setEnzymaticActivity(this.state.dataManager.catalyticact.isChecked(), this.state.dataManager.catalyticact.details());
                this.props.setOthergenefunc(this.state.dataManager.othergenefunc.isChecked(), this.state.dataManager.othergenefunc.details());
                if (this.state.dataManager.newmutant.prevSaved() && this.state.dataManager.rnai.prevSaved() &&
                    this.state.dataManager.overexpr.prevSaved() && this.state.dataManager.chemphen.prevSaved() &&
                    this.state.dataManager.envpheno.prevSaved() && this.state.dataManager.catalyticact.prevSaved() &&
                    this.state.dataManager.othergenefunc.prevSaved()) {
                    this.props.setIsPhenotypesSavedToDB();
                }

                // disease
                this.props.setDisease(this.state.dataManager.disease.isChecked(), this.state.dataManager.disease.details());
                if (this.state.dataManager.disease.prevSaved()) {
                    this.props.setIsDiseaseSavedToDB();
                }

                // comments
                this.props.setComments(this.state.dataManager.comments.details());
                if (this.state.dataManager.comments.prevSaved()) {
                    this.props.setIsCommentsSavedToDB();
                }
            })
            .catch((error) => {
                console.log(error);
                this.props.showDataFetchError();
            });

        this.state.dataManager.getPersonData(queryString.parse(this.props.location.search).passwd, queryString.parse(this.props.location.search).personid)
            .then(() => {
                this.props.setPerson(this.state.dataManager.person.name, this.state.dataManager.person.personId);
            })
            .catch((error) => {
                console.log(error);
                this.props.showDataFetchError();
            });

    }

    render() {
        let developmentBanner = "";
        if (process.env.NODE_ENV === "development") {
            developmentBanner = <div id="devBanner"><h3>Development Site</h3></div>;
        }
        return (
            <div>
                {developmentBanner}
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">
                            <MenuAndWidgets/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    setGenes, setSpecies, setGeneModel, setPerson, setIsOverviewSavedToDB,
    setAlleles, setStrains, setSequenceChange, setOtherAlleles, setOtherStrains, setIsGeneticsSavedToDB, setTransgenes,
    setOtherTransgenes, setOtherAntibodies, setNewAntibodies, setIsReagentSavedToDB, setExpression, setSiteOfAction,
    setTimeOfAction, setRnaseq, setAdditionalExpr, setIsExpressionSavedToDB, setGeneticInteractions,
    setPhysicalInteractions, setRegulatoryInteractions, setIsInteractionsSavedToDB, setAllelePhenotype,
    toggleAllelePhenotype, setRnaiPhenotype, setOverexprPhenotype, setChemicalPhenotype, setEnvironmentalPhenotype,
    setEnzymaticActivity, setOthergenefunc, setIsPhenotypesSavedToDB, setDisease, setIsDiseaseSavedToDB, setComments,
    setIsCommentsSavedToDB, showDataFetchError})(withRouter(Main));
