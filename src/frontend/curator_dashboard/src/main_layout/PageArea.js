import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import PaperViewer from "../pages/PaperViewer";
import Statistics from "../pages/Statistics";
import Lists from "../pages/PaperLists";
import Home from "../pages/Home";
import Contributors from "../pages/Contributors";
import Entities from "../pages/Entities";

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
                       render={() => <Statistics/>}/>
                <Route path={"/lists"}
                       render={() => <Lists/>}/>
                <Route path={"/contributors"}
                       render={() => <Contributors/>}/>
                <Route path={"/entities"}
                       render={() => <Entities/>}/>
            </div>
        );
    }
}

export default withRouter(PageArea);