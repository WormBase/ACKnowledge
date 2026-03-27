import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Form} from "react-bootstrap";

const AutoDetectedFlagsChart = () => {
    const [showTN, setShowTN] = useState(true);
    const {data, isSuccess} = useQuery('flagsConfusionMatrix', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_confusion_matrix")
    );

    const matrix = isSuccess ? data.data : {};

    const sorted = Object.entries(matrix)
        .sort((a, b) => (b[1].tp + b[1].fn) - (a[1].tp + a[1].fn));

    const categories = sorted.map(([name]) => name);

    const series = [
        {
            name: 'Predicted+, Author+ (TP)',
            data: sorted.map(([, d]) => d.tp),
            color: '#28a745',
            stack: 'agreement'
        },
        {
            name: 'Predicted-, Author+ (FN)',
            data: sorted.map(([, d]) => d.fn),
            color: '#007bff',
            stack: 'agreement'
        },
        {
            name: 'Predicted+, Author- (FP)',
            data: sorted.map(([, d]) => d.fp),
            color: '#f5c6cb',
            stack: 'rejected'
        },
    ];

    if (showTN) {
        series.push({
            name: 'Predicted-, Author- (TN)',
            data: sorted.map(([, d]) => d.tn),
            color: '#dee2e6',
            stack: 'rejected'
        });
    }

    const options = {
        chart: {type: 'bar', height: Math.max(400, categories.length * 45)},
        title: {text: 'Auto-Detected Data Types: Predicted vs Author'},
        subtitle: {text: 'Comparing automated predictions against author responses'},
        xAxis: {categories: categories, title: {text: null}},
        yAxis: {min: 0, title: {text: 'Number of papers'}},
        tooltip: {shared: true},
        plotOptions: {
            bar: {
                stacking: 'normal',
                dataLabels: {enabled: true, style: {fontSize: '11px'}},
                borderWidth: 0
            }
        },
        series: series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <Form.Check
                type="checkbox"
                label="Show True Negatives (TN)"
                checked={showTN}
                onChange={(e) => setShowTN(e.target.checked)}
                className="mt-2"
            />
        </div>
    );
};

export default AutoDetectedFlagsChart;
