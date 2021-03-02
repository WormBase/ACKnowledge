import React from 'react';

class FlaggedDiffRow extends React.Component {

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-sm-3">
                        {this.props.title}
                    </div>
                    <div className="col-sm-3">
                        Checked: <strong>{this.props.tfpChecked}</strong>
                    </div>
                    <div className="col-sm-3">
                        Checked: <strong>{this.props.afpDetails !== "'null'" ? this.props.afpChecked: ""}<br/></strong>
                        Details: <strong>{this.props.afpDetails !== "'null'" ? this.props.afpDetails : ""}</strong>
                    </div>
                    <div className="col-sm-3">
                        <strong>{this.props.afpDetails !== "'null'" ? this.props.tfpChecked !== this.props.afpChecked ? "Yes" : "No" : "No"}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <hr/>
                    </div>
                </div>
            </div>
        );
    }
}

export default FlaggedDiffRow;