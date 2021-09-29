import React, {useState} from "react";
import {useSelector} from "react-redux";
import LoadingOverlay from 'react-loading-overlay';
import {Redirect, Route} from "react-router-dom";
import Overview from "../widgets/Overview";
import Genetics from "../widgets/Genetics";
import {pages, WIDGET} from "../constants";
import Reagent from "../widgets/Reagent";
import Expression from "../widgets/Expression";
import Interactions from "../widgets/Interactions";
import Phenotypes from "../widgets/Phenotypes";
import Disease from "../widgets/Disease";
import FAQ from "../widgets/FAQ";
import ReleaseNotes from "../widgets/ReleaseNotes";
import ContactInfo from "../widgets/Comments";
import queryString from 'query-string';



const WidgetArea = ({urlQuery, history}) => {

    let parameters = queryString.parse(urlQuery);

    const [hideGenes, setHideGenes] = useState(parameters.hide_genes === "true");
    const [hideAlleles, setHideAlleles] = useState(parameters.hide_alleles === "true");
    const [hideStrains, setHideStrains] = useState(parameters.hide_strains === "true");
    const selectedWidget = useSelector((state) => state.widget.selectedWidget);
    const isLoading = useSelector((state) => state.display.loading);

    const enableEntityListVisibility = (entityType) => {
        let curParams = queryString.parse(urlQuery);
        curParams[entityType] = "false";
        history.push(pages[selectedWidget - 1] + "?" + queryString.stringify(curParams));
        setHideGenes(curParams["hide_genes"] === "true");
        setHideAlleles(curParams["hide_alleles"] === "true");
        setHideStrains(curParams["hide_strains"] === "true");
    }

    return (
        <LoadingOverlay
            active={isLoading}
            spinner
            text='Sending data ...'
        >
            <Route exact path="/" render={() => (
                <Redirect to={"/overview" + urlQuery}/>)}/>
            <Route path={"/" + WIDGET.OVERVIEW}
                   render={() => <Overview hideGenes={hideGenes}
                                           toggleEntityVisibilityCallback={enableEntityListVisibility}
                   />}
            />
            <Route path={"/" + WIDGET.GENETICS}
                   render={() => <Genetics hideAlleles={hideAlleles}
                                           hideStrains={hideStrains}
                                           toggleEntityVisibilityCallback={enableEntityListVisibility}
                   />}
            />
            <Route path={"/" + WIDGET.REAGENT}
                   render={() => <Reagent />}
            />
            <Route path={"/" + WIDGET.EXPRESSION}
                   render={() => <Expression />}
            />
            <Route path={"/" + WIDGET.INTERACTIONS}
                   render={() => <Interactions
                   />}
            />
            <Route path={"/" + WIDGET.PHENOTYPES}
                   render={() => <Phenotypes />}/>
            <Route path={"/" + WIDGET.DISEASE}
                   render={() => <Disease />}/>
            <Route path={"/" + WIDGET.COMMENTS} render={() => <ContactInfo/>}/>
            <Route path={"/" + WIDGET.HELP} render={() => <FAQ/>}/>
            <Route path={"/" + WIDGET.RELEASE_NOTES} render={() => <ReleaseNotes/>}/>
        </LoadingOverlay>
    )
}

export default WidgetArea;