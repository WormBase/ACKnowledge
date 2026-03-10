import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const TimeToSubmitChart = () => {
    const {data, isLoading, isSuccess} = useQuery('timeToSubmit', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/time_to_submit")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const daysData = isSuccess ? data.data.days_to_submit : [];

    // Bin the data into buckets manually for a clean column chart
    const maxDays = Math.min(Math.max(...daysData), 365);
    const binSize = 7; // weekly bins
    const numBins = Math.ceil(maxDays / binSize);
    const bins = new Array(numBins).fill(0);

    daysData.forEach(d => {
        if (d >= 0 && d <= maxDays) {
            const idx = Math.min(Math.floor(d / binSize), numBins - 1);
            bins[idx]++;
        }
    });

    const categories = bins.map((_, i) => {
        const start = i * binSize;
        const end = start + binSize;
        return start + '-' + end + 'd';
    });

    const options = {
        chart: {type: 'column'},
        title: {text: 'Time to Submit (days after email)'},
        subtitle: {text: 'Distribution of author response times'},
        xAxis: {
            categories: categories,
            title: {text: 'Days after email'},
            labels: {
                rotation: -45,
                step: Math.max(1, Math.floor(numBins / 15))
            }
        },
        yAxis: {
            title: {text: 'Number of papers'},
            min: 0
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{point.y} papers'
        },
        plotOptions: {
            column: {
                color: '#17a2b8',
                borderWidth: 0,
                pointPadding: 0.05,
                groupPadding: 0
            }
        },
        legend: {enabled: false},
        series: [{
            name: 'Papers',
            data: bins
        }]
    };

    const median = daysData.length > 0
        ? [...daysData].sort((a, b) => a - b)[Math.floor(daysData.length / 2)]
        : 0;

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <p className="text-center text-muted">
                Median: <strong>{Math.round(median)} days</strong>
                {' | '}Total submissions: <strong>{daysData.length}</strong>
            </p>
        </div>
    );
};

export default TimeToSubmitChart;
