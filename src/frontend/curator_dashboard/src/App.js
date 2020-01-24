import React, { Component } from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import Main from './main_layout/Main'

class App extends Component {
  render() {
      let developmentBanner = "";
      if (process.env.NODE_ENV === "development") {
          developmentBanner = <div id="devBanner"><h3>Development Site</h3></div>;
      }
      return (
          <div>
              {developmentBanner}
              <Router>
                  <Main/>
              </Router>
          </div>
      );
  }
}

export default App;
