import React, { Component } from 'react';
import './App.css';
import { Provider } from "react-redux";
import store from "./redux/store";
import Main from "./main_layout/Main";
import {BrowserRouter as Router} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";

const App = () => {

     const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <Router>
                    <Main/>
                </Router>
            </Provider>
        </QueryClientProvider>
    );
}

export default App;
