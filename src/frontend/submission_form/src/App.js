import React, { Component } from 'react';
import CacheBuster from 'react-cache-buster';
import './App.css';
import { Provider } from "react-redux";
import store from "./redux/store";
import Main from "./main_layout/Main";
import {BrowserRouter as Router} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";

const App = () => {

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
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <Router>
                        <Main/>
                    </Router>
                </Provider>
            </QueryClientProvider>
        </CacheBuster>
    );
}

export default App;
