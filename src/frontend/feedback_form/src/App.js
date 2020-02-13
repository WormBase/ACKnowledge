import React, { Component } from 'react';
import './App.css';
import {BrowserRouter as Router} from "react-router-dom";
import MenuAndWidgets from "./main_layout/menu_and_widgets/MenuAndWidgets";
import { Provider } from "react-redux";
import store from "./redux/store";

class App extends Component {

    render() {
        let developmentBanner = "";
        if (process.env.NODE_ENV === "development") {
            developmentBanner = <div id="devBanner"><h3>Development Site</h3></div>;
        }
        return (
            <Provider store={store}>
                <div>
                    {developmentBanner}
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <Router>
                                    <MenuAndWidgets/>
                                </Router>
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );
    }
}

export default App;
