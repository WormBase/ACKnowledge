import React, {Component} from 'react';
import CacheBuster from 'react-cache-buster';
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
          <CacheBuster
              currentVersion={Math.random().toString(36).substring(2, 8)}
              isEnabled={process.env.NODE_ENV === "production"} //If false, the library is disabled.
              isVerboseMode={false} //If true, the library writes verbose logs to console.
              loadingComponent={null} //If not pass, nothing appears at the time of new version check.
              metaFileDirectory={'.'} //If public assets are hosted somewhere other than root on your server.
              onCacheClear={() => window.location.reload(true)}
          >
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
          </CacheBuster>
      );
  }
}

export default App;
