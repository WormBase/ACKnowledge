import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import PaperViewer from "../pages/PaperViewer";
import Lists from "../pages/PaperLists";
import Home from "../pages/Home";
import Contributors from "../pages/Contributors";
import Entities from "../pages/Entities";
import UnifiedStatsPage from "../pages/stats/UnifiedStatsPage";
import SentenceClassification from "../pages/SentenceClassification";

class PageArea extends React.Component {

    render() {
        return(
            <div className="pre-scrollable main-page">
                <Route exact path="/" render={() => (<Redirect to={"/home"}/>)}/>
                <Route path={"/home"}
                       render={() => <Home/>}/>
                <Route path={"/paper"}
                       render={() => <PaperViewer/>}/>
                <Route path={"/stats"}
                       render={() => <UnifiedStatsPage defaultTab="response"/>}/>
                <Route path={"/lists"}
                       render={() => <Lists/>}/>
                <Route path={"/contributors"}
                       render={() => <Contributors/>}/>
                <Route path={"/entities"}
                       render={() => <Entities/>}/>
                <Route path={"/papers_stats"}
                       render={() => <UnifiedStatsPage defaultTab="entities"/>}/>
                <Route path={"/sentence_classification"}
                       render={() => <SentenceClassification/>}/>
            </div>
        );
    }
}

export default withRouter(PageArea);