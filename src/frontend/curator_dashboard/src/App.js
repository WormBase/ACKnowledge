import React, {Component} from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import Main from './Main';
import {Provider} from "react-redux";
import store from "./redux/store";

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
                  <Provider store={store}>
                      <QueryClientProvider client={queryClient}>
                          <Main/>
                      </QueryClientProvider>
                  </Provider>
              </Router>
          </div>
      );
  }
}

export default App;
