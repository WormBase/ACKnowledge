import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const RespRateTSChart = () => {
    const data = useQuery('respRateTS', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats_timeseries", {bin_size: 'y'}))
    const options = {
        title: {
            text: 'Response Rate over time'
        },
        subtitle: {
            text: 'Percentage of full submissions vs number of processed papers'
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        yAxis: {
            title: {
                text: 'Response rate %'
            }
        },
        xAxis: {
            categories: data.isSuccess ? data.data.data.map(statArr => statArr[0]) : []
        },
        series: [{
            name: "Response rate",
            data: data.isSuccess ? data.data.data.map(statArr => statArr[1][4].toFixed(4) * 100) : []
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

export default RespRateTSChart;