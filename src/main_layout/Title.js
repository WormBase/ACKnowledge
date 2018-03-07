import React from 'react';

class Title extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title
        };
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <h2 className="text-left">Congratulations on the publication of your paper!</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h5 className="text-left">{this.state.title}</h5>
                    </div>
                </div>
            </div>
        );
    }
}

export default Title;