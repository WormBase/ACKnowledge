import React from "react";
import {Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const AutoDetectedFlagsTable = () => {
    const {data: matrixData} = useQuery('flagsConfusionMatrix', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_confusion_matrix")
    );
    const {data: curatorData} = useQuery('flagsCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_curator_agreement")
    );

    const matrix = matrixData ? matrixData.data : {};
    const curator = curatorData ? curatorData.data : {};

    const sorted = Object.entries(matrix)
        .sort((a, b) => (b[1].tp + b[1].fn) - (a[1].tp + a[1].fn));

    return (
        <div>
            <p className="text-muted mb-2">
                Predicted = auto-detected by pipeline. Author = flagged by author. Curator = validated by WormBase curator.
            </p>
            <Table striped bordered hover size="sm" responsive>
                <thead>
                    <tr>
                        <th>Data Type</th>
                        <th>Papers</th>
                        <th>Author Flagged</th>
                        <th>Predicted</th>
                        <th>Pred vs Author Acc.</th>
                        <th>Pred vs Author F1</th>
                        <th>Curator Rev.</th>
                        <th>Author vs Curator Acc.</th>
                        <th>Author vs Curator F1</th>
                        <th>Pred vs Curator Acc.</th>
                        <th>Pred vs Curator F1</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(([name, d]) => {
                        const cur = curator[name] || {};
                        const authorFlagged = d.tp + d.fn;
                        const predicted = d.tp + d.fp;
                        return (
                            <tr key={name}>
                                <td><strong>{name}</strong></td>
                                <td>{d.papers}</td>
                                <td>{authorFlagged}</td>
                                <td>{predicted}</td>
                                <td style={{color: rateColor(d.accuracy)}}>
                                    <strong>{d.accuracy}%</strong>
                                </td>
                                <td style={{color: rateColor(d.f1)}}>
                                    <strong>{d.f1}%</strong>
                                </td>
                                <td>{cur.curator_reviewed || 0}</td>
                                <td>{cur.curator_reviewed > 0 ? (
                                    <span style={{color: rateColor(cur.accuracy_ac)}}>
                                        <strong>{cur.accuracy_ac}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                                <td>{cur.both_positive > 0 ? (
                                    <span style={{color: rateColor(cur.f1_ac)}}>
                                        <strong>{cur.f1_ac}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                                <td>{cur.accuracy_pc > 0 ? (
                                    <span style={{color: rateColor(cur.accuracy_pc)}}>
                                        <strong>{cur.accuracy_pc}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                                <td>{cur.f1_pc > 0 ? (
                                    <span style={{color: rateColor(cur.f1_pc)}}>
                                        <strong>{cur.f1_pc}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
};

export default AutoDetectedFlagsTable;
