import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {Badge, Card, Col, Container, Jumbotron, Row, Spinner} from "react-bootstrap";
import TabsArea from "./TabsArea";
import ReactHtmlParser from "html-react-parser";
import Button from "react-bootstrap/Button";
import {downloadFile} from "../../lib/file";
import {extractEntitiesFromTfpString} from "../../AFPValues";


class StatusArea extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            formDownloadLoading: false
        }
    }

    render() {
        let link_to_afp_form = "";
        if (this.props.link_to_afp_form !== "") {
            link_to_afp_form = <div><br/><a href={this.props.link_to_afp_form} target="_blank"><strong>Link to AFP form</strong></a></div>
        }
        if (this.props.paper_id !== undefined && this.props.paper_id !== "undefined") {
            return (
                <Container fluid>
                    <LoadingOverlay
                        active={this.props.isLoading}
                        spinner
                        text='Loading status info...'
                        styles={{
                            overlay: (base) => ({
                                ...base,
                                background: 'rgba(65,105,225,0.5)'
                            })
                        }}
                    >
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                <Card>
                                    <Card.Header>Paper Info</Card.Header>
                                    <Card.Body><strong>Title:</strong> &nbsp; {ReactHtmlParser(this.props.paper_title)}<br/>
                                        <strong>Journal:</strong> &nbsp; {this.props.paper_journal}<br/>
                                        <strong>Email:</strong> &nbsp; {this.props.email} <br/>
                                        <strong>Link to pubmed source:</strong> &nbsp; <a href={"https://www.ncbi.nlm.nih.gov/pubmed/" + this.props.pmid} target="blank_">{"https://www.ncbi.nlm.nih.gov/pubmed/" + this.props.pmid}</a> <br/>
                                        <strong>Link to doi source:</strong> &nbsp; <a href={"https://doi.org/" + this.props.doi} target="blank_">{"https://doi.org/" + this.props.doi}</a><br/>
                                        {link_to_afp_form}
                                        <br/>
                                        <Button size="sm" onClick={async () => {
                                            let formContent = "WormBase Author First Pass\n\nSome of the results provided in this form (marked as TPC powered) have been automatically extracted by our text mining methods. Please modify the values as needed\n\nENTITIES IDENTIFIED IN THE PAPER\n\n";
                                            let payload = {
                                                paper_id: this.props.paper_id
                                            };
                                            if (payload.paper_id !== undefined) {
                                                let responseEntities = await fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/lists", {
                                                    method: 'POST',
                                                    headers: {
                                                        'Accept': 'text/html',
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify(payload)
                                                });
                                                let entities = await responseEntities.json();
                                                let responseFlags = await fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/flagged", {
                                                    method: 'POST',
                                                    headers: {
                                                        'Accept': 'text/html',
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify(payload)
                                                });
                                                let flags = await responseFlags.json();
                                                let tfp_genestudied = entities["tfp_genestudied"];
                                                if (tfp_genestudied !== '' && tfp_genestudied !== 'null') {
                                                    tfp_genestudied = extractEntitiesFromTfpString(entities["tfp_genestudied"], "WBGene");
                                                } else {
                                                    tfp_genestudied = [];
                                                }
                                                let tfp_species = entities["tfp_species"];
                                                if (tfp_species !== '' && tfp_species !== 'null') {
                                                    tfp_species = entities["tfp_species"].split(" | ");
                                                } else {
                                                    tfp_species = [];
                                                }
                                                let tfp_alleles = entities["tfp_alleles"];
                                                if (tfp_alleles !== 'null' && tfp_alleles !== '') {
                                                    tfp_alleles = extractEntitiesFromTfpString(entities["tfp_alleles"], "");
                                                } else {
                                                    tfp_alleles = [];
                                                }
                                                let tfp_strains = entities["tfp_strains"];
                                                if (tfp_strains !== 'null' && tfp_strains !== '') {
                                                    tfp_strains = entities["tfp_strains"].split(" | ");
                                                } else {
                                                    tfp_strains = [];
                                                }
                                                let tfp_transgenes = entities["tfp_transgenes"];
                                                if (tfp_transgenes !== '' && tfp_transgenes !== 'null') {
                                                    tfp_transgenes = extractEntitiesFromTfpString(entities["tfp_transgenes"], "");
                                                } else {
                                                    tfp_transgenes = [];
                                                }
                                                formContent += "GENES (TPC powered)\n";
                                                formContent += tfp_genestudied.join("\n") + "\n\n";
                                                formContent += "SPECIES (TPC powered)\n";
                                                formContent += tfp_species.join("\n") + "\n\n";
                                                formContent += "ALLELES (TPC powered)\n";
                                                formContent += tfp_alleles.join("\n") + "\n\n";
                                                formContent += "STRAINS (TPC powered)\n";
                                                formContent += tfp_strains.join("\n") + "\n\n";
                                                formContent += "TRANSGENES (TPC powered)\n";
                                                formContent += tfp_transgenes.join("\n") + "\n\n";
                                                formContent += "New Genes reported\nNone\n\n";
                                                formContent += "New Alleles reported\nNone\n\n";
                                                formContent += "New Strains reported\nNone\n\n";
                                                formContent += "New Transgenes reported\nNone\n\n";
                                                formContent += "Known Antobodies used in the study\nNone\n\n";
                                                formContent += "Are you reporting an allele sequence change? (TPC powered)\n" + (flags["svm_seqchange_checked"] ? "Yes" : "No") + "\n\n";
                                                formContent += "Are you reporting a Gene model update and gene sequence connection?\nNo\n\n";
                                                formContent += "Did you generate a new antibody? If yes specify\nNo\n\n";

                                                formContent += "DATATYPES\n\n";
                                                formContent += "Anatomic Expression data in WT condition (TPC powered)\n" + (flags["svm_otherexpr_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Site of action data\nNo\n\n";
                                                formContent += "Time of action data\nNo\n\n";
                                                formContent += "RNAseq data\nNo\n\n";
                                                formContent += "Genetic Interactions (TPC powered)\n" + (flags["svm_geneint_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Physical Interactions (TPC powered)\n" + (flags["svm_geneprod_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Regulatory Interactions (TPC powered)\n" + (flags["svm_genereg_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Allele-Phenotype data (TPC powered)\n" + (flags["svm_newmutant_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Allele-RNAi data (TPC powered)\n" + (flags["svm_rnai_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Transgene Overexpression Phenotype data (TPC powered)\n" + (flags["svm_overexpr_checked"] ? "Yes": "No") + "\n\n";
                                                formContent += "Chemical Induced Phenotype Data\nNo\n\n";
                                                formContent += "Environmental Induced Phenotype Data\nNo\n\n";
                                                formContent += "Enzymatic activity Data\nNo\n\n";

                                                formContent += "OTHER DATA\n\n";

                                                formContent += "Does the paper report Disease Model data?\nNo\n\n";
                                                formContent += "Are there additional types of expression data? e.g. qPCR or proteomics\nNo\n\n";
                                                formContent += "Add any additional comment here\n";

                                                downloadFile(formContent, "AFP_manual_form", "text/plain", "csv");
                                            }}} variant="outline-primary">Download manual submission form{this.props.formDownloadLoading ? <Spinner as="span" animation="border"
                                                                                            size="sm" role="status"
                                                                                            aria-hidden="true" variant="secondary"/> : ''}</Button>
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
                            <Col sm="12">
                                <Card>
                                    <Card.Header>Paper Status</Card.Header>
                                    <Card.Body>Processed by AFP: &nbsp; <Badge variant="secondary">{this.props.paper_afp_processed}</Badge><br/>
                                        {this.props.paper_afp_processed === 'TRUE' ? <div>Processed on: {this.props.paper_afp_processed_date}<br/></div> : ''}
                                        Final data submitted by author: &nbsp; <Badge variant="secondary">{this.props.paper_author_submitted}</Badge><br/>
                                        Author has modified any data (including partial submissions): &nbsp; <Badge variant="secondary">{this.props.paper_author_modified}</Badge>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </LoadingOverlay>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <TabsArea show={this.props.load_diff}/>
                        </Col>
                    </Row>
                </Container>
            )
        } else {
            return (
                <Container fluid>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="2">
                            &nbsp;
                        </Col>
                        <Col sm="8">
                            <Jumbotron>
                                <h3>Paper not loaded</h3>
                                <p>
                                    Enter the 8 digit ID of a paper to see its AFP curation status.
                                </p>
                            </Jumbotron>
                        </Col>
                        <Col sm="2">
                            &nbsp;
                        </Col>
                    </Row>
                </Container>
            )
        }
    }
}

export default StatusArea;
