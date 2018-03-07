import React, { Component } from 'react';
import './App.css';
import Title from './main_layout/Title'
import {BrowserRouter as Router} from "react-router-dom";
import MenuAndWidgets from "./main_layout/MenuAndWidgets";

class App extends Component {

    render() {
        return (
            <div>
                <Title title="&quot;The ENU-3 protein family members function in the Wnt pathway parallel to
                UNC-6/Netrin to promote neuron axon outgrowth in C. elegans.&quot; Dev Biol, 2017"/>
                <div className="container">
                    <div className="row">
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
