import React, { Component } from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import Main from './main_layout/Main'

class App extends Component {
  render() {
    return (
        <div>
            <Router>
                <Main/>
            </Router>
        </div>
    );
  }
}

export default App;
