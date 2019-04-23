import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import PaperViewer from "../pages/PaperViewer";
import Statistics from "../pages/Statistics";
import Lists from "../pages/Lists";

class PageArea extends React.Component {

    render() {
        return(
            <div className="pre-scrollable main-page">
                <Route exact path="/" render={() => (<Redirect to={"/paper"}/>)}/>
                <Route path={"/paper"}
                       render={() => <PaperViewer/>}/>
                <Route path={"/stats"}
                       render={() => <Statistics/>}/>
                <Route path={"/lists"}
                       render={() => <Lists/>}/>
            </div>
        );
    }
}

export default withRouter(PageArea);