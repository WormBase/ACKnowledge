import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const AUTHOR_ONLY_FLAGS = [
    "Gene model update", "Antibody", "Site of action", "Time of action",
    "RNAseq", "Chemical phenotype", "Environmental phenotype", "Disease"
];

const AuthorOnlyFlagsChart = () => {
    const {data, isSuccess} = useQuery('dataTypeFlagsStats', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_stats")
    );

    const flagData = isSuccess ? data.data : {};

    const filtered = Object.entries(flagData)
        .filter(([name]) => AUTHOR_ONLY_FLAGS.includes(name))
        .sort((a, b) => b[1] - a[1]);

    const categories = filtered.map(([name]) => name);
    const values = filtered.map(([, count]) => count);

    const options = {
        chart: {type: 'bar', height: Math.max(300, categories.length * 35)},
        title: {text: 'Author-Only Data Types'},
        subtitle: {text: 'Number of submitted papers where authors flagged each data type'},
        xAxis: {categories: categories, title: {text: null}},
        yAxis: {min: 0, title: {text: 'Number of papers'}},
        tooltip: {pointFormat: '<b>{point.y}</b> papers'},
        plotOptions: {
            bar: {
                dataLabels: {enabled: true},
                color: '#6f42c1',
                borderWidth: 0
            }
        },
        legend: {enabled: false},
        series: [{name: 'Papers', data: values}]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default AuthorOnlyFlagsChart;
