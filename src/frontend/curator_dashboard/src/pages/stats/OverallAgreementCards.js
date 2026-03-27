import React, {useState} from "react";
import {Card, Col, Row, Spinner} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const MetricCard = ({title, rows, borderColor}) => (
    <Card className="text-center" style={{borderTop: `3px solid ${borderColor}`}}>
        <Card.Body style={{padding: '12px 10px'}}>
            <small className="text-muted"><strong>{title}</strong></small>
            <hr style={{margin: '6px 0'}}/>
            {rows.map((row, idx) => (
                <div key={idx} style={{marginTop: idx > 0 ? '6px' : '0'}}>
                    <span style={{fontSize: '1.1em', fontWeight: 'bold', color: rateColor(row.value)}}>
                        {row.value}%
                    </span>
                    <br/>
                    <small className="text-muted">{row.label}</small>
                </div>
            ))}
        </Card.Body>
    </Card>
);

const EntityTrendsChart = ({tsData, binSize}) => {
    const showYearOnly = binSize.includes('y');
    const categories = tsData.map(item => {
        if (showYearOnly) return item[0].split('-')[0];
        return item[0];
    });

    const series = [
        {
            name: 'Predicted vs Author',
            data: tsData.map(item => item[1].entities_pred_vs_author_jaccard || 0),
            color: '#007bff',
        },
        {
            name: 'Author vs Curator',
            data: tsData.map(item => item[1].entities_author_vs_curator_jaccard || 0),
            color: '#28a745',
            dashStyle: 'Dash',
        },
        {
            name: 'Predicted vs Curator',
            data: tsData.map(item => item[1].entities_pred_vs_curator_jaccard || 0),
            color: '#dc3545',
            dashStyle: 'Dash',
        },
    ];

    const options = {
        title: {text: 'Entity Jaccard Index Over Time'},
        subtitle: {text: 'Macro-averaged across all entity types. Dashed = curator comparisons (overall, not per-period).'},
        xAxis: {categories},
        yAxis: {title: {text: 'Jaccard Index (%)'}, min: 0, max: 100},
        plotOptions: {line: {dataLabels: {enabled: true, format: '{y}%'}, connectNulls: true}},
        tooltip: {shared: true, valueSuffix: '%'},
        series
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const FlagsTrendsChart = ({tsData, binSize}) => {
    const showYearOnly = binSize.includes('y');
    const categories = tsData.map(item => {
        if (showYearOnly) return item[0].split('-')[0];
        return item[0];
    });

    const pairs = [
        {key: 'flags_pred_vs_author', label: 'Predicted vs Author', color: '#007bff'},
        {key: 'flags_author_vs_curator', label: 'Author vs Curator', color: '#28a745'},
        {key: 'flags_pred_vs_curator', label: 'Predicted vs Curator', color: '#dc3545'},
    ];

    const series = [];
    pairs.forEach(pair => {
        series.push({
            name: pair.label + ' Accuracy',
            data: tsData.map(item => item[1][pair.key + '_accuracy'] || 0),
            color: pair.color,
        });
        series.push({
            name: pair.label + ' F1',
            data: tsData.map(item => item[1][pair.key + '_f1'] || 0),
            color: pair.color,
            dashStyle: 'Dash',
        });
    });

    const options = {
        title: {text: 'Data Type Flags Accuracy & F1 Over Time'},
        subtitle: {text: 'Macro-averaged across all data type flags. Solid = accuracy, dashed = F1.'},
        xAxis: {categories},
        yAxis: {title: {text: 'Score (%)'}, min: 0, max: 100},
        plotOptions: {line: {dataLabels: {enabled: true, format: '{y}%'}, connectNulls: true}},
        tooltip: {shared: true, valueSuffix: '%'},
        series
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

const OverallAgreementCards = () => {
    const [binSize, setBinSize] = useState('y');

    const {data, isLoading, isSuccess} = useQuery('overallAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/overall_agreement")
    );
    const {data: tsRaw, isLoading: tsLoading} = useQuery(
        'overallTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/overall_timeseries",
            {bin_size: binSize}
        )
    );

    if (isLoading || tsLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const d = isSuccess ? data.data : {};
    const ent = d.entities || {};
    const flg = d.flags || {};
    const tsData = tsRaw ? tsRaw.data : [];

    return (
        <div>
            <h5 className="mb-3">Overall Comparison</h5>

            <h6 className="text-muted">Entities (Jaccard Index)</h6>
            <Row className="mb-3">
                <Col md={4}>
                    <MetricCard
                        title="Predicted vs Author"
                        borderColor={rateColor(ent.predicted_vs_author || 0)}
                        rows={[{label: 'Jaccard Index', value: ent.predicted_vs_author || 0}]}
                    />
                </Col>
                <Col md={4}>
                    <MetricCard
                        title="Author vs Curator"
                        borderColor={rateColor(ent.author_vs_curator || 0)}
                        rows={[{label: 'Jaccard Index', value: ent.author_vs_curator || 0}]}
                    />
                </Col>
                <Col md={4}>
                    <MetricCard
                        title="Predicted vs Curator"
                        borderColor={rateColor(ent.predicted_vs_curator || 0)}
                        rows={[{label: 'Jaccard Index', value: ent.predicted_vs_curator || 0}]}
                    />
                </Col>
            </Row>
            <EntityTrendsChart tsData={tsData} binSize={binSize} />

            <hr/>

            <h6 className="text-muted">Data Type Flags (Accuracy &amp; F1)</h6>
            <Row className="mb-3">
                <Col md={4}>
                    <MetricCard
                        title="Predicted vs Author"
                        borderColor={rateColor(flg.predicted_vs_author_accuracy || 0)}
                        rows={[
                            {label: 'Accuracy', value: flg.predicted_vs_author_accuracy || 0},
                            {label: 'F1 Score', value: flg.predicted_vs_author_f1 || 0},
                        ]}
                    />
                </Col>
                <Col md={4}>
                    <MetricCard
                        title="Author vs Curator"
                        borderColor={rateColor(flg.author_vs_curator_accuracy || 0)}
                        rows={[
                            {label: 'Accuracy', value: flg.author_vs_curator_accuracy || 0},
                            {label: 'F1 Score', value: flg.author_vs_curator_f1 || 0},
                        ]}
                    />
                </Col>
                <Col md={4}>
                    <MetricCard
                        title="Predicted vs Curator"
                        borderColor={rateColor(flg.predicted_vs_curator_accuracy || 0)}
                        rows={[
                            {label: 'Accuracy', value: flg.predicted_vs_curator_accuracy || 0},
                            {label: 'F1 Score', value: flg.predicted_vs_curator_f1 || 0},
                        ]}
                    />
                </Col>
            </Row>
            <FlagsTrendsChart tsData={tsData} binSize={binSize} />

            <div className="mt-2">
                Interval:&nbsp;
                <select onChange={(e) => setBinSize(e.target.value)}>
                    <option value="y">1 year</option>
                    <option value="m">1 month</option>
                </select>
            </div>
        </div>
    );
};

export default OverallAgreementCards;
