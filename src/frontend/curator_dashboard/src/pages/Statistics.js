import React, {useState} from 'react';
import {withRouter} from "react-router-dom";
import RespRateTSChart from "./stats/RespRateTSChart";
import RespRateTotalPieCharts from "./stats/RespRateTotalPieCharts";


const Statistics = () => {
    const [binSize, setBinSize] = useState('y');
    return(
        <div>
            <RespRateTotalPieCharts/>
            <hr/>
            <RespRateTSChart bin_size={binSize}/>
            Interval period
            <br/>
            <select onChange={(event) => setBinSize(event.target.value)}>
                <option value="y">1 year</option>
                <option value="m">1 month</option>
            </select>
        </div>
    );
}

export default withRouter(Statistics);