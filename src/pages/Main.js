import React from 'react';
import EmailLogin from "./EmailLogin";
import Lists from "./Lists";
import queryString from "query-string";

class Main extends React.Component {
    constructor(props, context) {
        super(props, context);
        let token = undefined;
        let url = document.location.toString();
        if (url.match("\\?")) {
            token = queryString.parse(document.location.search).token
        }
        this.state = {
            token: token
        };
    }

    render() {
        if (this.state.token !== undefined) {
            return (<Lists token={this.state.token}/>);
        } else {
            return (<EmailLogin/>);
        }
    }
}

export default Main;