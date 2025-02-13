import React, { Component } from 'react';
import CacheBuster from 'react-cache-buster';
import './App.css';
import Main from "./pages/Main";
import { Provider } from "react-redux";
import store from "./redux/store"

class App extends Component {
  render() {
      return (
          <CacheBuster
              currentVersion={Math.random().toString(36).substring(2, 8)}
              isEnabled={process.env.NODE_ENV === "production"} //If false, the library is disabled.
              isVerboseMode={false} //If true, the library writes verbose logs to console.
              loadingComponent={null} //If not pass, nothing appears at the time of new version check.
              metaFileDirectory={'.'} //If public assets are hosted somewhere other than root on your server.
              onCacheClear={() => window.location.reload(true)}
          >
              <Provider store={store}>
                  <Main/>
              </Provider>
          </CacheBuster>
    );
  }
}

export default App;
