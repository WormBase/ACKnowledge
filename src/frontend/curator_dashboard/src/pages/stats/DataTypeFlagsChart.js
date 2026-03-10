import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const DataTypeFlagsChart = () => {
    const {data, isLoading, isSuccess} = useQuery('dataTypeFlagsStats', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_stats")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const flagData = isSuccess ? data.data : {};

    // Sort by count descending
    const sorted = Object.entries(flagData).sort((a, b) => b[1] - a[1]);
    const categories = sorted.map(([name]) => name);
    const values = sorted.map(([, count]) => count);

    const options = {
        chart: {type: 'bar', height: Math.max(400, categories.length * 30)},
        title: {text: 'Data Types Flagged by Authors'},
        subtitle: {text: 'Number of submitted papers where authors confirmed each data type'},
        xAxis: {
            categories: categories,
            title: {text: null}
        },
        yAxis: {
            min: 0,
            title: {text: 'Number of papers'}
        },
        tooltip: {
            pointFormat: '<b>{point.y}</b> papers'
        },
        plotOptions: {
            bar: {
                dataLabels: {enabled: true},
                color: '#6f42c1',
                borderWidth: 0
            }
        },
        legend: {enabled: false},
        series: [{
            name: 'Papers',
            data: values
        }]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default DataTypeFlagsChart;
