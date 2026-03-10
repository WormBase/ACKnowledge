import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const ConfirmationRateTrends = () => {
    const [binSize, setBinSize] = useState('y');
    const {data, isLoading, isSuccess} = useQuery(
        'confirmationRatesTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/confirmation_rates_timeseries",
            {bin_size: binSize}
        )
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const tsData = isSuccess ? data.data : [];
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const entityTypes = ['genes', 'species', 'alleles', 'strains', 'transgenes'];
    const colors = {
        genes: '#007bff',
        species: '#28a745',
        alleles: '#dc3545',
        strains: '#ffc107',
        transgenes: '#17a2b8'
    };
    const labels = {
        genes: 'Genes',
        species: 'Species',
        alleles: 'Alleles',
        strains: 'Strains',
        transgenes: 'Transgenes'
    };

    const series = entityTypes.map(type => ({
        name: labels[type],
        data: tsData.map(item => item[1][type] || 0),
        color: colors[type],
        connectNulls: true
    }));

    const options = {
        title: {text: 'Entity Confirmation Rates Over Time'},
        subtitle: {text: 'Percentage of extracted entities confirmed by authors'},
        xAxis: {categories: categories},
        yAxis: {
            title: {text: 'Confirmation Rate (%)'},
            min: 0,
            max: 100
        },
        plotOptions: {
            line: {
                dataLabels: {enabled: true, format: '{y}%'},
                enableMouseTracking: true,
                connectNulls: true
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: '%'
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

export default ConfirmationRateTrends;
