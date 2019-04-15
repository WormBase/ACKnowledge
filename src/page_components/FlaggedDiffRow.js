import React from 'react';

class EntityDiffRow extends React.Component {

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-sm-3">
                        {this.props.title}
                    </div>
                    <div className="col-sm-3">
                        Checked: {this.props.tfpChecked}
                    </div>
                    <div className="col-sm-3">
                        Checked: {this.props.afpChecked}<br/>
                        Details: {this.props.afpDetails}
                    </div>
                    <div className="col-sm-3">
                        {this.props.tfpChecked !== this.props.afpChecked ? "True" : "False"}
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

export default EntityDiffRow;