import React, {useState} from "react";
import {Container, Tab, Tabs} from "react-bootstrap";
import KPISummaryCards from "./KPISummaryCards";
import OverallAgreementCards from "./OverallAgreementCards";
import RespRateTotalPieCharts from "./RespRateTotalPieCharts";
import RespRateTSChart from "./RespRateTSChart";
import TimeToSubmitChart from "./TimeToSubmitChart";
import EntityBreakdownChart from "./EntityBreakdownChart";
import EntityDetailTable from "./EntityDetailTable";
import ManuallyAddedEntities from "./ManuallyAddedEntities";
import ConfirmationRateTrends from "./ConfirmationRateTrends";
import AutoDetectedFlagsChart from "./AutoDetectedFlagsChart";
import AutoDetectedFlagsTable from "./AutoDetectedFlagsTable";
import AuthorOnlyFlagsChart from "./AuthorOnlyFlagsChart";
import AuthorOnlyFlagsTable from "./AuthorOnlyFlagsTable";
import DataTypeFlagsAccuracyTrends from "./DataTypeFlagsAccuracyTrends";
import ContributorRoles from "./ContributorRoles";
import ContributorRolesTimeSeries from "./ContributorRolesTimeSeries";
import ContributorRolesSummary from "./ContributorRolesSummary";

const UnifiedStatsPage = ({defaultTab = "response"}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <Container fluid>
            <br/>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} id="stats-tabs">
                <Tab eventKey="response" title="Response Rate">
                    <br/>
                    <KPISummaryCards/>
                    <hr/>
                    <RespRateTotalPieCharts/>
                    <hr/>
                    <RespRateTSChart/>
                    <hr/>
                    <TimeToSubmitChart/>
                </Tab>
                <Tab eventKey="overview" title="Overall Comparison">
                    {activeTab === "overview" && <>
                        <br/>
                        <OverallAgreementCards/>
                    </>}
                </Tab>
                <Tab eventKey="entities" title="Entities">
                    {activeTab === "entities" && <>
                        <br/>
                        <h5>Auto-Detected Entities</h5>
                        <EntityBreakdownChart/>
                        <EntityDetailTable/>
                        <ConfirmationRateTrends/>
                        <hr/>
                        <h5>Author-Only Entities</h5>
                        <ManuallyAddedEntities/>
                    </>}
                </Tab>
                <Tab eventKey="flags" title="Data Type Flags">
                    {activeTab === "flags" && <>
                        <br/>
                        <h5>Auto-Detected Data Types</h5>
                        <AutoDetectedFlagsChart/>
                        <AutoDetectedFlagsTable/>
                        <DataTypeFlagsAccuracyTrends/>
                        <hr/>
                        <h5>Author-Only Data Types</h5>
                        <AuthorOnlyFlagsChart/>
                        <AuthorOnlyFlagsTable/>
                    </>}
                </Tab>
                <Tab eventKey="contributors" title="Contributors">
                    {activeTab === "contributors" && <>
                        <br/>
                        <ContributorRoles/>
                        <hr/>
                        <ContributorRolesTimeSeries/>
                        <hr/>
                        <ContributorRolesSummary/>
                    </>}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default UnifiedStatsPage;
