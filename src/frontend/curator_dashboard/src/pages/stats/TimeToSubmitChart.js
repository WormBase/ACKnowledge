import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const TimeToSubmitChart = () => {
    const [binSize, setBinSize] = useState('y');
    const {data, isLoading, isSuccess} = useQuery(
        'timeToSubmit' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/time_to_submit",
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
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const avgDays = tsData.map(item => item[1]);
    const counts = tsData.map(item => item[2]);

    const options = {
        title: {text: 'Average Time to Submit Over Time'},
        subtitle: {text: 'Mean number of days between email and author submission'},
        xAxis: {categories: categories},
        yAxis: [{
            title: {text: 'Average days'},
            min: 0
        }, {
            title: {text: 'Number of submissions'},
            opposite: true,
            min: 0
        }],
        tooltip: {shared: true},
        plotOptions: {
            line: {
                dataLabels: {enabled: true, format: '{y}d'},
                enableMouseTracking: true
            }
        },
        series: [{
            name: 'Avg. days to submit',
            data: avgDays,
            color: '#17a2b8',
            tooltip: {valueSuffix: ' days'},
            yAxis: 0
        }, {
            name: 'Submissions',
            data: counts,
            type: 'column',
            color: '#dee2e6',
            tooltip: {valueSuffix: ' papers'},
            yAxis: 1
        }]
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            Interval period
            <br/>
            <select onChange={(event) => setBinSize(event.target.value)}>
                <option value="y">1 year</option>
                <option value="m">1 month</option>
            </select>
        </div>
    );
};

export default TimeToSubmitChart;
