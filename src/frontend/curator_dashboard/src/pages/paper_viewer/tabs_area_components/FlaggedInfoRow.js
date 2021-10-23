import React from 'react';

const FlaggedInfoRow = ({title, afpChecked, afpDetails}) => {
    return(
        <div>
            <div className="row">
                <div className="col-sm-6">
                    {title}
                </div>
                <div className="col-sm-6">
                    Checked: <strong>{afpChecked}<br/></strong>
                    Details: <strong>{afpDetails}</strong>
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

export default FlaggedInfoRow;