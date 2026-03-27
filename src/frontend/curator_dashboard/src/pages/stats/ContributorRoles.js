import React from "react";
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

const ContributorRoles = () => {
    const {data, isSuccess} = useQuery('contributorRoles', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributor_roles")
    );

    const roles = isSuccess ? data.data : {};

    const pieData = Object.entries(roles)
        .filter(([, d]) => d.submissions > 0)
        .map(([name, d]) => ({
            name: name,
            y: d.submissions,
            color: ROLE_COLORS[name] || '#6c757d'
        }));

    const options = {
        chart: {type: 'pie'},
        title: {text: 'Submissions by Role'},
        subtitle: {text: 'Role at time of submission'},
        tooltip: {
            pointFormat: '<b>{point.y}</b> submissions ({point.percentage:.1f}%)'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)'
                }
            }
        },
        series: [{
            name: 'Submissions',
            data: pieData
        }]
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <p style={{fontSize: '0.85em', background: '#e8f4fd', padding: '8px 12px', borderRadius: '4px', border: '1px solid #bee5eb'}}>
                <strong>How roles are determined:</strong> Roles reflect the contributor's position at the time of submission,
                based on the WormBase person database. <strong>PI</strong> = listed in the PI table.{' '}
                <strong>PI (estimated)</strong> = not in the PI table but recorded as having supervised students
                or postdocs, indicating PI-level status.{' '}
                <strong>No lineage data</strong> = person not found in the WormBase person database.{' '}
                <strong>Expired role</strong> = has a known role but date range doesn't cover the submission period.{' '}
                <strong>Unknown in database</strong> = person exists but role is explicitly marked as unknown.
            </p>
        </div>
    );
};

export default ContributorRoles;
