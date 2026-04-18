import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Table} from "react-bootstrap";

const ManuallyAddedEntities = () => {
    const {data, isSuccess} = useQuery('manuallyAddedEntities', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/manually_added_entities_stats")
    );

    const stats = isSuccess ? data.data : {};

    const sorted = Object.entries(stats)
        .sort((a, b) => b[1].total_added - a[1].total_added);
    const categories = sorted.map(([name]) => name);
    const values = sorted.map(([, s]) => s.total_added);

    const chartOptions = {
        chart: {type: 'bar', height: Math.max(250, categories.length * 40)},
        title: {text: 'Manually Added Entities'},
        subtitle: {text: 'Free-text entities added by authors (not from pipeline extraction)'},
        xAxis: {categories: categories, title: {text: null}},
        yAxis: {min: 0, title: {text: 'Total added'}},
        tooltip: {pointFormat: '<b>{point.y}</b> entities'},
        plotOptions: {
            bar: {
                dataLabels: {enabled: true},
                color: '#17a2b8',
                borderWidth: 0
            }
        },
        legend: {enabled: false},
        series: [{name: 'Added', data: values}]
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            <Table striped bordered hover size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th>Entity Type</th>
                        <th>Papers with Additions</th>
                        <th>Total Added</th>
                        <th>Avg per Paper</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(([name, s]) => (
                        <tr key={name}>
                            <td><strong>{name}</strong></td>
                            <td>{s.papers_with_additions}</td>
                            <td>{s.total_added}</td>
                            <td>{s.avg_per_paper}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ManuallyAddedEntities;
