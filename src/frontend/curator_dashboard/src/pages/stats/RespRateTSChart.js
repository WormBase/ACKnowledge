import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const RespRateTSChart = ({bin_size = 'y'}) => {
    const data = useQuery('respRateTS' + bin_size, () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats_timeseries", {bin_size: bin_size}))
    const showYearOnly = bin_size.includes("y");
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
        xAxis: {
            categories: data.isSuccess ? data.data.data.map(statArr => {
                if (showYearOnly) {
                    return statArr[0].split("-")[0];
                } else {
                    return statArr[0];
                }
            }) : []
        },
        series: [
            {
                name: "Response rate (%)",
                data: data.isSuccess ? data.data.data.map(statArr => parseFloat((statArr[1][4] * 100).toFixed(2))) : []
            },
            {
                name: "Full submissions",
                data: data.isSuccess ? data.data.data.map(statArr => statArr[1][1]) : [],
                visible: false
            },
            {
                name: "Partial submissions",
                data: data.isSuccess ? data.data.data.map(statArr => statArr[1][2]) : [],
                visible: false
            },
            {
                name: "Processed but w/o submission",
                data: data.isSuccess ? data.data.data.map(statArr => statArr[1][3]) : [],
                visible: false
            },
            {
                name: "Processed (total)",
                data: data.isSuccess ? data.data.data.map(statArr => statArr[1][0]) : [],
                visible: false
            }
        ]
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