import React, { Component } from 'react';
import CacheBuster from 'react-cache-buster';
import {version} from '../package.json';
import './App.css';
import { Provider } from "react-redux";
import store from "./redux/store";
import Main from "./main_layout/Main";
import {BrowserRouter as Router} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";

const App = () => {

    const queryClient = new QueryClient()
    const handleCacheClear = () => {
        window.location.reload(true);
    };

    return (
        <CacheBuster
            currentVersion={version}
            isEnabled={process.env.NODE_ENV === "production"} //If false, the library is disabled.
            isVerboseMode={false} //If true, the library writes verbose logs to console.
            loadingComponent={null} //If not pass, nothing appears at the time of new version check.
            metaFileDirectory={'.'} //If public assets are hosted somewhere other than root on your server.
            onCacheClear={handleCacheClear}
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
