import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";

const ENTITY_COLORS = {
    genes: '#007bff', species: '#28a745', alleles: '#dc3545',
    strains: '#ffc107', transgenes: '#17a2b8'
};
const ENTITY_LABELS = {
    genes: 'Genes', species: 'Species', alleles: 'Alleles',
    strains: 'Strains', transgenes: 'Transgenes'
};
const ALL_ENTITIES = ['genes', 'species', 'alleles', 'strains', 'transgenes'];

const ConfirmationRateTrends = () => {
    const [binSize, setBinSize] = useState('y');
    const [pair, setPair] = useState('predicted_vs_author');
    const {data, isSuccess} = useQuery(
        'confirmationRatesTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/confirmation_rates_timeseries",
            {bin_size: binSize}
        )
    );
    const {data: curatorData} = useQuery('entityCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_curator_agreement")
    );

    const tsData = isSuccess ? data.data : [];
    const curator = curatorData ? curatorData.data : {};
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) return item[0].split('-')[0];
        return item[0];
    });

    const pairLabels = {
        predicted_vs_author: 'Predicted vs Author',
        author_vs_curator: 'Author vs Curator',
        predicted_vs_curator: 'Predicted vs Curator',
    };

    let series = [];

    if (pair === 'predicted_vs_author') {
        series = ALL_ENTITIES.map(type => ({
            name: ENTITY_LABELS[type],
            data: tsData.map(item => {
                const val = item[1][type];
                if (val && typeof val === 'object') return val.jaccard || val.accuracy || 0;
                return val || 0;
            }),
            color: ENTITY_COLORS[type],
            connectNulls: true
        }));
    } else {
        const curatorKey = pair === 'author_vs_curator'
            ? 'jaccard_author_curator' : 'jaccard_pipeline_curator';
        ['genes', 'species'].forEach(type => {
            const cur = curator[type];
            if (cur && cur.papers_with_curator_data > 0) {
                series.push({
                    name: ENTITY_LABELS[type],
                    data: categories.map(() => cur[curatorKey] || 0),
                    color: ENTITY_COLORS[type],
                    connectNulls: true
                });
            }
        });
    }

    const options = {
        title: {text: 'Entity Jaccard Index Over Time (' + pairLabels[pair] + ')'},
        subtitle: {text: pair === 'predicted_vs_author'
            ? 'Per-period Jaccard for all entity types'
            : 'Curator comparison available for genes and species only (shown as reference lines)'},
        xAxis: {categories},
        yAxis: {title: {text: 'Jaccard Index (%)'}, min: 0, max: 100},
        plotOptions: {line: {dataLabels: {enabled: true, format: '{y}%'}, connectNulls: true}},
        tooltip: {shared: true, valueSuffix: '%'},
        series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <div className="mt-2">
                Comparison:&nbsp;
                <select value={pair} onChange={(e) => setPair(e.target.value)}>
                    <option value="predicted_vs_author">Predicted vs Author</option>
                    <option value="author_vs_curator">Author vs Curator</option>
                    <option value="predicted_vs_curator">Predicted vs Curator</option>
                </select>
                &nbsp;&nbsp;Interval:&nbsp;
                <select onChange={(e) => setBinSize(e.target.value)}>
                    <option value="y">1 year</option>
                    <option value="m">1 month</option>
                </select>
            </div>
        </div>
    );
};

export default ConfirmationRateTrends;
