import React from 'react';

const FlaggedInfoRow = ({title, afpChecked, afpDetails}) => {
    return(
        <div>
            <div className="row">
                <div className="col-sm-6">
                    {title}
                </div>
                <div className="col-sm-6">
                    Checked: <strong>{afpDetails !== "'null'" && afpDetails !== "null" ? afpChecked: "N/A"}<br/></strong>
                    Details: <strong>{afpDetails !== "'null'" && afpDetails !== "null" ? afpDetails: "N/A"}</strong>
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