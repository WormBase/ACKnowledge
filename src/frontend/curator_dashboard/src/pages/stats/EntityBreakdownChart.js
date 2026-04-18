import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const EntityBreakdownChart = () => {
    const {data, isSuccess} = useQuery('entityConfirmationRates', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_confirmation_rates")
    );

    const rates = isSuccess ? data.data : {};
    const entityLabels = {
        genes: "Genes",
        species: "Species",
        alleles: "Alleles",
        strains: "Strains",
        transgenes: "Transgenes"
    };

    // Sort by total submitted (confirmed + added) descending
    const sorted = Object.entries(entityLabels)
        .map(([key, label]) => {
            const entity = rates[key] || {};
            return {
                key,
                label,
                confirmed: entity.total_confirmed || 0,
                added: entity.total_added || 0,
                removed: entity.total_removed || 0,
            };
        })
        .sort((a, b) => (b.confirmed + b.added) - (a.confirmed + a.added));

    const categories = sorted.map(e => e.label);

    const options = {
        chart: {type: 'bar', height: Math.max(300, categories.length * 60)},
        title: {text: 'Entity Breakdown: Confirmed vs Added vs Removed'},
        subtitle: {text: 'Comparing pipeline-extracted entities against author submissions'},
        xAxis: {
            categories: categories,
            title: {text: null}
        },
        yAxis: {
            min: 0,
            title: {text: 'Number of entities'}
        },
        tooltip: {shared: true},
        plotOptions: {
            bar: {
                stacking: 'normal',
                dataLabels: {enabled: true, style: {fontSize: '11px'}},
                borderWidth: 0
            }
        },
        series: [{
            name: 'Confirmed',
            data: sorted.map(e => e.confirmed),
            color: '#28a745',
            stack: 'submitted'
        }, {
            name: 'Added by authors',
            data: sorted.map(e => e.added),
            color: '#007bff',
            stack: 'submitted'
        }, {
            name: 'Removed by authors',
            data: sorted.map(e => e.removed),
            color: '#f5c6cb',
            stack: 'removed'
        }]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default EntityBreakdownChart;
