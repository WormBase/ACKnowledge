import React from 'react';
import {withRouter} from "react-router-dom";
import {Container} from "react-bootstrap";
import RespRateTSChart from "./stats/RespRateTSChart";
import RespRateTotalPieCharts from "./stats/RespRateTotalPieCharts";
import KPISummaryCards from "./stats/KPISummaryCards";
import TimeToSubmitChart from "./stats/TimeToSubmitChart";
import SubmissionFunnel from "./stats/SubmissionFunnel";


const Statistics = () => {
    return(
        <Container fluid>
            <br/>
            <KPISummaryCards/>
            <hr/>
            <RespRateTotalPieCharts/>
            <hr/>
            <SubmissionFunnel/>
            <hr/>
            <RespRateTSChart/>
            <hr/>
            <TimeToSubmitChart/>
        </Container>
    );
}

export default withRouter(Statistics);
