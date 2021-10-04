export const getToken = (emailAddress) => {
    if (emailAddress !== undefined && payload.email !== "undefined") {
        let payload = { email: emailAddress };
        fetch(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/get_token_from_email", {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                this.setState({showError: true});
            }
        }).then(data => {
            if (data === undefined) {
            } else {
                this.props.callback(data["token"]);
            }
        }).catch((err) => {
            alert(err);
        });
    }
}

export const requestEmailLink = () => {
    let payload = { email: this.state.email_address };
    if (payload.email !== undefined && payload.email !== "undefined" && payload.email !== "") {
        fetch(process.env.REACT_APP_API_DB_READ_ENDPOINT + "/send_link", {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.status === 200) {
                this.setState({showSuccess: true});
            } else {
                this.setState({showError: true});
            }
        }).then(data => {
            if (data === undefined) {
            } else {
            }
        }).catch((err) => {
            alert(err);
        });
    }
}

export const logIn = () => {
    if (process.env.REACT_APP_REQUEST_AUTH === "true") {
        this.requestEmailLink()
    } else {
        this.getToken();
    }
}