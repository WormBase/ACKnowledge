import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const ROLE_COLORS = {
    "PI": '#007bff',
    "PI (estimated)": '#5fa8e8',
    "Postdoc": '#28a745',
    "PhD": '#ffc107',
    "Masters": '#17a2b8',
    "Undergrad": '#fd7e14',
    "Research staff": '#e83e8c',
    "Lab visitor": '#20c997',
    "Collaborator": '#6610f2',
    "Asst. professor": '#dc3545',
    "Sabbatical": '#795548',
    "Highschool": '#ff9800',
    "No lineage data": '#6c757d',
    "Expired role": '#adb5bd',
    "Unknown in database": '#ced4da',
    "No timestamp": '#dee2e6',
    "Other": '#495057',
};
const ALL_ROLES = [
    "PI", "PI (estimated)", "Postdoc", "PhD", "Masters", "Undergrad",
    "Research staff", "Lab visitor", "Collaborator",
    "Asst. professor", "Sabbatical", "Highschool",
    "No lineage data", "Expired role", "Unknown in database",
    "No timestamp", "Other",
];

const ContributorRolesTimeSeries = () => {
    const [binSize, setBinSize] = useState('y');
    const {data, isSuccess} = useQuery(
        'contributorRolesTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributor_roles_timeseries",
            {bin_size: binSize}
        )
    );

    const tsData = isSuccess ? data.data : [];
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const series = ALL_ROLES.map(role => ({
        name: role,
        data: tsData.map(item => item[1][role] || 0),
        color: ROLE_COLORS[role]
    }));

    const options = {
        chart: {type: 'column'},
        title: {text: 'Role Distribution Over Time'},
        xAxis: {categories: categories},
        yAxis: {min: 0, title: {text: 'Submissions'}, stackLabels: {enabled: true}},
        tooltip: {shared: true},
        plotOptions: {
            column: {stacking: 'normal', borderWidth: 0}
        },
        series: series
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

export default ContributorRolesTimeSeries;
