import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const OverallTrends = () => {
    const [binSize, setBinSize] = useState('y');
    const [view, setView] = useState('entities');
    const {data, isLoading, isSuccess} = useQuery(
        'overallTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/overall_timeseries",
            {bin_size: binSize}
        )
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const tsData = isSuccess ? data.data : [];
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) return item[0].split('-')[0];
        return item[0];
    });

    let series = [];
    let title = '';
    let subtitle = '';

    if (view === 'entities') {
        title = 'Entity Jaccard Index Over Time';
        subtitle = 'Macro-averaged Jaccard index (predicted vs author) across all entity types';
        series = [{
            name: 'Predicted vs Author (Jaccard)',
            data: tsData.map(item => item[1].entities_pred_vs_author_jaccard || 0),
            color: '#007bff',
        }];
    } else {
        title = 'Data Type Flags Accuracy & F1 Over Time';
        subtitle = 'Macro-averaged across all auto-detected data type flags. Solid = accuracy, dashed = F1.';
        const pairs = [
            {key: 'flags_pred_vs_author', label: 'Predicted vs Author', color: '#007bff'},
            {key: 'flags_author_vs_curator', label: 'Author vs Curator', color: '#28a745'},
            {key: 'flags_pred_vs_curator', label: 'Predicted vs Curator', color: '#dc3545'},
        ];
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
    }

    const options = {
        title: {text: title},
        subtitle: {text: subtitle},
        xAxis: {categories: categories},
        yAxis: {
            title: {text: 'Score (%)'},
            min: 0,
            max: 100
        },
        plotOptions: {
            line: {
                dataLabels: {enabled: true, format: '{y}%'},
                enableMouseTracking: true,
                connectNulls: true
            }
        },
        tooltip: {shared: true, valueSuffix: '%'},
        series: series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <div className="mt-2">
                View:&nbsp;
                <select value={view} onChange={(e) => setView(e.target.value)}>
                    <option value="entities">Entities (Jaccard)</option>
                    <option value="flags">Data Type Flags (Accuracy &amp; F1)</option>
                </select>
                &nbsp;&nbsp;Interval:&nbsp;
                <select onChange={(e) => setBinSize(e.target.value)}>
                    <option value="y">1 year</option>
                    <option value="m">1 month</option>
                </select>
            </div>
        </div>
    );
};

export default OverallTrends;
