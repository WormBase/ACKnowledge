import React from "react";
import {Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const AUTHOR_ONLY_FLAGS = [
    "Gene model update", "Antibody", "Site of action", "Time of action",
    "RNAseq", "Chemical phenotype", "Environmental phenotype", "Disease"
];

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const AuthorOnlyFlagsTable = () => {
    const {data: flagsData} = useQuery('dataTypeFlagsStats', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_stats")
    );
    const {data: kpiData} = useQuery('statsKpi', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats_kpi")
    );
    const {data: curatorData} = useQuery('flagsCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_curator_agreement")
    );

    const flagCounts = flagsData ? flagsData.data : {};
    const totalSubmissions = kpiData && kpiData.data ? kpiData.data.full_submissions : 0;
    const curator = curatorData ? curatorData.data : {};

    const filtered = Object.entries(flagCounts)
        .filter(([name]) => AUTHOR_ONLY_FLAGS.includes(name))
        .sort((a, b) => b[1] - a[1]);

    return (
        <Table striped bordered hover size="sm" responsive>
            <thead>
                <tr>
                    <th>Data Type</th>
                    <th>Papers Flagged</th>
                    <th>% of Submissions</th>
                    <th>Curator Reviewed</th>
                    <th>Author vs Curator Acc.</th>
                    <th>Author vs Curator F1</th>
                </tr>
            </thead>
            <tbody>
                {filtered.map(([name, count]) => {
                    const pct = totalSubmissions > 0
                        ? Math.round(count / totalSubmissions * 1000) / 10
                        : 0;
                    const cur = curator[name] || {};
                    return (
                        <tr key={name}>
                            <td><strong>{name}</strong></td>
                            <td>{count}</td>
                            <td>{pct}%</td>
                            <td>{cur.curator_reviewed || 0}</td>
                            <td>{cur.curator_reviewed > 0 ? (
                                <span style={{color: rateColor(cur.accuracy_ac || 0)}}>
                                    <strong>{cur.accuracy_ac || 0}%</strong>
                                </span>
                            ) : "\u2014"}</td>
                            <td>{cur.both_positive > 0 ? (
                                <span style={{color: rateColor(cur.f1_ac || 0)}}>
                                    <strong>{cur.f1_ac || 0}%</strong>
                                </span>
                            ) : "\u2014"}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default AuthorOnlyFlagsTable;
