import React, { Component } from 'react';
import './App.css';
import Main from "./pages/Main";
import { Provider } from "react-redux";
import store from "./redux/store"

class App extends Component {
  render() {
    return (
        <Provider store={store}>
            <Main/>
        </Provider>
    );
  }
}

export default App;
