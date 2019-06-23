import React from 'react';

class FlaggedInfoRow extends React.Component {

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-sm-6">
                        {this.props.title}
                    </div>
                    <div className="col-sm-6">
                        Checked: <strong>{this.props.afpChecked}<br/></strong>
                        Details: <strong>{this.props.afpDetails}</strong>
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

export default FlaggedInfoRow;