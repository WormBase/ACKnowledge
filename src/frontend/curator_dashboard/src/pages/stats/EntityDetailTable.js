import React from "react";
import {OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const EntityDetailTable = () => {
    const {data: ratesData} = useQuery('entityConfirmationRates', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_confirmation_rates")
    );
    const {data: curatorData} = useQuery('entityCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_curator_agreement")
    );

    const rates = ratesData ? ratesData.data : {};
    const curator = curatorData ? curatorData.data : {};

    const entityLabels = {
        genes: "Genes",
        species: "Species",
        alleles: "Alleles",
        strains: "Strains",
        transgenes: "Transgenes"
    };
    const hasCurator = {"genes": true, "species": true};

    return (
        <div>
            <h5 className="mb-1">Entity Detail</h5>
            <p className="text-muted mb-3">
                Jaccard Index = intersection / union of entity sets. Higher means more overlap.
            </p>
            <Table striped bordered hover size="sm" responsive>
                <thead>
                    <tr>
                        <th>Entity Type</th>
                        <th>Papers</th>
                        <th>Extracted</th>
                        <th>Author Submitted</th>
                        <th>Pred vs Author Jaccard</th>
                        <th>Author vs Curator Jaccard</th>
                        <th>Pred vs Curator Jaccard</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(entityLabels).map(([key, label]) => {
                        const entity = rates[key] || {};
                        const cur = curator[key] || {};
                        const curAvail = hasCurator[key];
                        return (
                            <tr key={key}>
                                <td><strong>{label}</strong></td>
                                <td>{entity.num_papers || 0}</td>
                                <td>{entity.total_extracted || 0}</td>
                                <td>{entity.total_submitted || 0}</td>
                                <td style={{color: rateColor(entity.jaccard_pred_author || 0)}}>
                                    <strong>{entity.jaccard_pred_author || 0}%</strong>
                                </td>
                                <td>{curAvail ? (
                                    <span style={{color: rateColor(cur.jaccard_author_curator || 0)}}>
                                        <strong>{cur.jaccard_author_curator || 0}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                                <td>{curAvail ? (
                                    <span style={{color: rateColor(cur.jaccard_pipeline_curator || 0)}}>
                                        <strong>{cur.jaccard_pipeline_curator || 0}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            <p className="text-muted mt-2 mb-1" style={{fontSize: '0.85em'}}>
                Curator comparison for alleles, strains, and transgenes is pending ABC API integration.
            </p>
            <p className="mt-1 mb-0" style={{fontSize: '0.85em', background: '#fff3cd', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ffc107'}}>
                <strong>Note:</strong> Curator gene data reflects targeted curation (avg. ~2 genes/paper)
                vs. comprehensive author submissions (avg. ~22 genes/paper).
                Low Jaccard for genes reflects different scope — curators only
                confirm genes relevant to their specific curation task, not the
                full list. Species lists are closer in size, resulting in higher overlap.
            </p>
        </div>
    );
};

export default EntityDetailTable;
