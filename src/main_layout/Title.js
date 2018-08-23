import React from 'react';

class Title extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title
        };
    }

    static removePdfTags(string) {
        let regex = /(<([^>]+)>)/ig;
        return string.replace(regex, "")
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <h3 className="text-left">Congratulations on the publication of your paper!</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h4 className="text-left">{Title.removePdfTags(this.state.title)}</h4>
                    </div>
                </div>
            </div>
        );
    }
}

export default Title;