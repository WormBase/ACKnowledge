import React, { Component } from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import {QueryClientProvider, QueryClient} from "react-query";
import Main from './main_layout/Main'

class App extends Component {
  render() {
      let developmentBanner = "";
      if (process.env.NODE_ENV === "development") {
          developmentBanner = <div id="devBanner"><h3>Development Site</h3></div>;
      }
      const queryClient = new QueryClient();
      return (
          <div>
              {developmentBanner}
              <Router>
                  <QueryClientProvider client={queryClient}>
                      <Main/>
                  </QueryClientProvider>
              </Router>
          </div>
      );
  }
}

export default App;
