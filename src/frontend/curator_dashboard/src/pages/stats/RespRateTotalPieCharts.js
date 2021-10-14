import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const RespRateTotalPieCharts = () => {
    const data = useQuery('respRateTotals', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats_totals"))
    const options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Total response rate'
        },
        tooltip: {
            pointFormat: '<b>Percentage: {point.percentage:.1f}% <br/>Total: {point.y}</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        colors: ["#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %<br>total: {point.y}'
                }
            }
        },
        series: [{
            name: 'Totals',
            colorByPoint: true,
            data: [{
                name: 'Full submissions',
                y: data.isSuccess ? parseInt(data.data.data.num_papers_new_afp_author_submitted) : null
            }, {
                name: 'Partial submissions',
                y: data.isSuccess ? parseInt(data.data.data.num_papers_new_afp_partial_sub) : null
            }, {
                name: 'Waiting for submission',
                y: data.isSuccess ? parseInt(data.data.data.num_papers_new_afp_processed) : null
            }]
        }]
    }

    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </div>
    );
}

export default RespRateTotalPieCharts;