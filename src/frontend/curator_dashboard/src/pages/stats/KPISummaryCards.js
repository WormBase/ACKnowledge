import React from "react";
import {Card, Col, Row, Spinner} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const KPISummaryCards = () => {
    const {data, isLoading, isSuccess} = useQuery('statsKpi', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats_kpi")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const kpi = isSuccess ? data.data : {};

    const cards = [
        {label: "Total Processed", value: kpi.total_processed, color: "#007bff"},
        {label: "Response Rate", value: kpi.response_rate + "%", color: "#28a745"},
        {label: "Avg. Days to Submit", value: kpi.avg_time_to_submit_days, color: "#17a2b8"},
        {label: "Awaiting Response", value: kpi.papers_awaiting, color: "#ffc107"},
        {label: "Unique Contributors", value: kpi.unique_contributors, color: "#6f42c1"}
    ];

    return (
        <Row className="mb-4">
            {cards.map((card, idx) => (
                <Col key={idx}>
                    <Card className="text-center" style={{borderTop: `3px solid ${card.color}`}}>
                        <Card.Body style={{padding: '15px 10px'}}>
                            <h3 style={{marginBottom: '5px', color: card.color}}>
                                {card.value}
                            </h3>
                            <small className="text-muted">{card.label}</small>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default KPISummaryCards;
