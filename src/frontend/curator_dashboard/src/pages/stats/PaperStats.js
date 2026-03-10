import React from "react";
import {Container} from "react-bootstrap";
import ConfirmationRateCards from "./ConfirmationRateCards";
import DataTypeFlagsChart from "./DataTypeFlagsChart";
import ConfirmationRateTrends from "./ConfirmationRateTrends";

const PaperStats = () => {
    return (
        <Container fluid>
            <br/>
            <ConfirmationRateCards/>
            <hr/>
            <DataTypeFlagsChart/>
            <hr/>
            <ConfirmationRateTrends/>
        </Container>
    );
};

export default PaperStats;
