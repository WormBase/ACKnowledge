import React from "react";
import {Card, Col, Row, Spinner, Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const ConfirmationRateCards = () => {
    const {data, isLoading, isSuccess} = useQuery('entityConfirmationRates', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_confirmation_rates")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const rates = isSuccess ? data.data : {};
    const entityLabels = {
        genes: "Genes",
        species: "Species",
        alleles: "Alleles",
        strains: "Strains",
        transgenes: "Transgenes"
    };

    return (
        <div>
            <h5 className="mb-3">Extraction Accuracy</h5>
            <Row className="mb-4">
                {Object.entries(entityLabels).map(([key, label]) => {
                    const entity = rates[key] || {};
                    const rate = entity.confirmation_rate || 0;
                    return (
                        <Col key={key}>
                            <Card className="text-center" style={{borderTop: `3px solid ${rateColor(rate)}`}}>
                                <Card.Body style={{padding: '15px 10px'}}>
                                    <h3 style={{marginBottom: '5px', color: rateColor(rate)}}>
                                        {rate}%
                                    </h3>
                                    <small className="text-muted">{label}</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Entity Type</th>
                        <th>Papers</th>
                        <th>Extracted</th>
                        <th>Confirmed</th>
                        <th>Removed</th>
                        <th>Added by authors</th>
                        <th>Confirmation Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(entityLabels).map(([key, label]) => {
                        const entity = rates[key] || {};
                        return (
                            <tr key={key}>
                                <td><strong>{label}</strong></td>
                                <td>{entity.num_papers || 0}</td>
                                <td>{entity.total_extracted || 0}</td>
                                <td>{entity.total_confirmed || 0}</td>
                                <td>{entity.total_removed || 0}</td>
                                <td>{entity.total_added || 0}</td>
                                <td style={{color: rateColor(entity.confirmation_rate || 0)}}>
                                    <strong>{entity.confirmation_rate || 0}%</strong>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
};

export default ConfirmationRateCards;
