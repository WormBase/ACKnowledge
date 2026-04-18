import React from "react";
import {Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const ALL_ROLES = [
    "PI", "PI (estimated)", "Postdoc", "PhD", "Masters", "Undergrad",
    "Research staff", "Lab visitor", "Collaborator",
    "Asst. professor", "Sabbatical", "Highschool",
    "No lineage data", "Expired role", "Unknown in database",
    "No timestamp", "Other",
];

const ContributorRolesSummary = () => {
    const {data, isSuccess} = useQuery('contributorRoles', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributor_roles")
    );

    const roles = isSuccess ? data.data : {};

    return (
        <div>
        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                    <th>Role</th>
                    <th>Submissions</th>
                    <th>% of Total</th>
                    <th>Unique People</th>
                </tr>
            </thead>
            <tbody>
                {ALL_ROLES.map(role => {
                    const d = roles[role] || {};
                    return (
                        <tr key={role}>
                            <td><strong>{role}</strong></td>
                            <td>{d.submissions || 0}</td>
                            <td>{d.percentage || 0}%</td>
                            <td>{d.unique_people || 0}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
        </div>
    );
};

export default ContributorRolesSummary;
