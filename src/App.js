import React, { Component } from 'react';
import './App.css';
import Title from './main_layout/Title'
import {BrowserRouter as Router} from "react-router-dom";
import MenuAndWidgets from "./main_layout/MenuAndWidgets";

class App extends Component {

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <Router>
                            <MenuAndWidgets/>
                        </Router>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
