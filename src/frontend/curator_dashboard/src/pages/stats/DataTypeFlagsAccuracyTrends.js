import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const COLORS = {
    "Expression": '#007bff',
    "Seq. change": '#28a745',
    "Genetic int.": '#dc3545',
    "Physical int.": '#ffc107',
    "Regulatory int.": '#17a2b8',
    "Allele phenotype": '#6f42c1',
    "RNAi phenotype": '#fd7e14',
    "Overexpr. phenotype": '#20c997',
    "Enzymatic activity": '#e83e8c',
};

const DataTypeFlagsAccuracyTrends = () => {
    const [binSize, setBinSize] = useState('y');
    const [metric, setMetric] = useState('f1');
    const [pair, setPair] = useState('predicted_vs_author');

    const {data: paData} = useQuery(
        'flagsAccuracyTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_accuracy_timeseries",
            {bin_size: binSize}
        )
    );
    const {data: curatorData} = useQuery('flagsCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_curator_agreement")
    );

    const tsData = paData ? paData.data : [];
    const curator = curatorData ? curatorData.data : {};
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) return item[0].split('-')[0];
        return item[0];
    });

    const pairLabels = {
        predicted_vs_author: 'Predicted vs Author',
        author_vs_curator: 'Author vs Curator',
        predicted_vs_curator: 'Predicted vs Curator',
    };

    let series = [];
    if (pair === 'predicted_vs_author') {
        series = Object.keys(COLORS).map(name => ({
            name: name,
            data: tsData.map(item => {
                const d = item[1][name] || {};
                return d[metric] || 0;
            }),
            color: COLORS[name],
            connectNulls: true
        }));
    } else {
        // Author vs Curator or Predicted vs Curator: show overall values as reference lines
        const isPC = pair === 'predicted_vs_curator';
        const valueKey = metric === 'f1'
            ? (isPC ? 'f1_pc' : 'f1_ac')
            : (isPC ? 'accuracy_pc' : 'accuracy_ac');
        Object.keys(COLORS).forEach(name => {
            const cur = curator[name];
            if (cur && cur.curator_reviewed > 0 && (cur[valueKey] || 0) > 0) {
                series.push({
                    name: name,
                    data: categories.map(() => cur[valueKey] || 0),
                    color: COLORS[name],
                    connectNulls: true
                });
            }
        });
    }

    const metricLabel = metric === 'f1' ? 'F1 Score' : 'Accuracy';

    const options = {
        title: {text: 'Data Type Flag ' + metricLabel + ' Over Time (' + pairLabels[pair] + ')'},
        subtitle: {text: pair === 'predicted_vs_author'
            ? 'Auto-detected data type flags'
            : 'Curator agreement shown as reference lines (not yet binned by period)'},
        xAxis: {categories: categories},
        yAxis: {
            title: {text: metricLabel + ' (%)'},
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
                Comparison:&nbsp;
                <select value={pair} onChange={(e) => setPair(e.target.value)}>
                    <option value="predicted_vs_author">Predicted vs Author</option>
                    <option value="author_vs_curator">Author vs Curator</option>
                    <option value="predicted_vs_curator">Predicted vs Curator</option>
                </select>
                &nbsp;&nbsp;Metric:&nbsp;
                <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                    <option value="f1">F1 Score</option>
                    <option value="accuracy">Accuracy</option>
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

export default DataTypeFlagsAccuracyTrends;
