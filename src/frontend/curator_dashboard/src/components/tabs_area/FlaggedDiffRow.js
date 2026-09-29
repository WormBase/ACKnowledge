import React from 'react';
import {authorChanged} from "../../lib/abcClassifiers";

const FlaggedDiffRow = ({title, tfpChecked, afpChecked, afpDetails}) => {
    return(
        <div>
            <div className="row">
                <div className="col-sm-3">
                    {title}
                </div>
                <div className="col-sm-3">
                    Checked: <strong>{tfpChecked}</strong>
                </div>
                <div className="col-sm-3">
                    Checked: <strong>{afpDetails !== "'null'" && afpDetails !== "null" ? afpChecked: "N/A"}<br/></strong>
                    Details: <strong>{afpDetails !== "'null'" && afpDetails !== "null" ? afpDetails : "N/A"}</strong>
                </div>
                <div className="col-sm-3">
                    <strong>{authorChanged(tfpChecked, afpChecked, afpDetails)}</strong>
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

export default FlaggedDiffRow;