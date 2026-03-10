import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const SubmissionFunnel = () => {
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
    const emailed = kpi.total_processed || 0;
    const partial = kpi.partial_submissions || 0;
    const submitted = kpi.full_submissions || 0;

    const options = {
        chart: {type: 'bar', height: 250},
        title: {text: 'Submission Funnel'},
        subtitle: {text: 'Author engagement progression'},
        xAxis: {
            categories: ['Emailed', 'Partial save', 'Submitted'],
            lineWidth: 0
        },
        yAxis: {
            title: {text: 'Number of papers'},
            min: 0
        },
        tooltip: {
            pointFormat: '<b>{point.y} papers</b> ({point.pct}%)'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    format: '{point.y} ({point.pct}%)'
                },
                colorByPoint: true
            }
        },
        colors: ['#007bff', '#ffc107', '#28a745'],
        legend: {enabled: false},
        series: [{
            name: 'Papers',
            data: [
                {y: emailed, pct: '100'},
                {y: partial, pct: emailed > 0 ? ((partial / emailed) * 100).toFixed(1) : '0'},
                {y: submitted, pct: emailed > 0 ? ((submitted / emailed) * 100).toFixed(1) : '0'}
            ]
        }]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default SubmissionFunnel;
