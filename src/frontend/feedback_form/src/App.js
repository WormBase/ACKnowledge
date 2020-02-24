import React, { Component } from 'react';
import './App.css';
import { Provider } from "react-redux";
import store from "./redux/store";
import Main from "./main_layout/Main";
import {BrowserRouter as Router} from "react-router-dom";

class App extends Component {

    render() {
        return (
            <Provider store={store}>
                <Router>
                    <Main/>
                </Router>
            </Provider>
        );
    }
}

export default App;
