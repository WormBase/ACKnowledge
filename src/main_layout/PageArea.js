import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import PaperViewer from "../pages/PaperViewer";
import Statistics from "../pages/Statistics";

class PageArea extends React.Component {

    render() {
        return(
            <div>
                <Route exact path="/" render={() => (<Redirect to={"/paper"}/>)}/>
                <Route path={"/paper"}
                       render={() => <PaperViewer/>}/>
                <Route path={"/stats"}
                       render={() => <Statistics/>}/>
            </div>
        );
    }
}

export default withRouter(PageArea);