import React from "react";
import {drawAFPChart} from "./d3Charts";
import {useQuery} from "react-query";
import axios from "axios";
import {Card, Col, Container, Row, Spinner} from "react-bootstrap";

const PaperStats = () => {
    const data = useQuery('paperStats', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/paper_stats", {})
    );

    if (!data.isLoading) {
        drawAFPChart("numGenesHist", data.data.data.num_extracted_genes_per_paper);
        drawAFPChart("numSpeciesHist", data.data.data.num_extracted_species_per_paper);
        drawAFPChart("numAllelesHist", data.data.data.num_extracted_alleles_per_paper);
        drawAFPChart("numStrainsHist", data.data.data.num_extracted_strains_per_paper);
        drawAFPChart("numTransgenesHist", data.data.data.num_extracted_transgenes_per_paper);
    }
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col sm="6">
                        <Card>
                            <Card.Header>
                                Number of genes per paper
                            </Card.Header>
                            <Card.Body>
                                <svg width="300" height="300" id="numGenesHist"/>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card>
                            <Card.Header>
                                Number of species per paper
                            </Card.Header>
                            <Card.Body>
                                <svg width="300" height="300" id="numSpeciesHist"/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="6">
                        <Card>
                            <Card.Header>
                                Number of alleles per paper
                            </Card.Header>
                            <Card.Body>
                                <svg width="300" height="300" id="numAllelesHist"/>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card>
                            <Card.Header>
                                Number of strains per paper
                            </Card.Header>
                            <Card.Body>
                                <svg width="300" height="300" id="numStrainsHist"/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="6">
                        <Card>
                            <Card.Header>
                                Number of transgenes per paper
                            </Card.Header>
                            <Card.Body>
                                <svg width="300" height="300" id="numTransgenesHist"/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default PaperStats;