import React from 'react';
import {withRouter} from "react-router-dom";
import RespRateTSChart from "./stats/RespRateTSChart";
import RespRateTotalPieCharts from "./stats/RespRateTotalPieCharts";


const Statistics = () => {
    return(
        <div>
            <RespRateTotalPieCharts/>
            <hr/>
            <RespRateTSChart/>
        </div>
    );
}

export default withRouter(Statistics);