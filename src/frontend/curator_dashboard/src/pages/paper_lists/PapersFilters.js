import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import FormGroup from "react-bootstrap/FormGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
class PapersFilters extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            countValidationState: null,
            papersPerPage: props.papersPerPage,
        }
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm="6">
                        <Card>
                            <Card.Header>Data Extraction Info (thresholds)</Card.Header>
                            <Card.Body>
                                <strong>gene: 2, protein: 2, allele: 2, strain: 1, species: 10, transgene: 1</strong>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card>
                            <Card.Header>Page Options</Card.Header>
                            <Card.Body>
                                <Form onSubmit={e => e.preventDefault()} inline>
                                    <FormGroup controlId="formValidationError2"
                                               validationState={this.state.countValidationState}>
                                        <Form.Label>Papers per page: &nbsp;</Form.Label>
                                        <FormControl
                                            type="text" autoComplete="off" maxLength="3" size="sm"
                                            placeholder={this.state.papersPerPage}
                                            onInput={(event) => {
                                                if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) &&
                                                    isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
                                                    this.setState({
                                                        papersPerPage: event.target.value,
                                                        countValidationState: null
                                                    })
                                                } else if (event.target.value !== "") {
                                                    this.setState({
                                                        countValidationState: "error"
                                                    })
                                                } else {
                                                    this.setState({
                                                        countValidationState: null
                                                    })
                                                }
                                            }}
                                            onKeyPress={(target) => {
                                                if (target.key === 'Enter' &&
                                                    this.state.papersPerPage > 0) {
                                                    this.props.setNumPapersPerPageCallback(this.state.papersPerPage);
                                                }
                                            }}
                                        />
                                        <Button variant="outline-primary" size="sm" onClick={() => {
                                            if (
                                                this.state.papersPerPage > 0) {
                                                this.props.setNumPapersPerPageCallback(this.state.papersPerPage);
                                            }
                                        }}>Refresh</Button>
                                    </FormGroup>
                                </Form>
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
                            <Card.Header>Filter paper lists by flagged data types</Card.Header>
                            <Card.Body>
                                <Container fluid>
                                    <Row>
                                        <Col sm="12">
                                            <ul>
                                                <li>
                                                    SVM filters are applied to EXTRACTED data for 'waiting for
                                                    submissions' and 'partial submissions', and to SUBMITTED data for
                                                    full submissions
                                                </li>
                                                <li>
                                                    Manual filters are applied to SUBMITTED data
                                                </li>
                                            </ul>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="12">
                                            &nbsp;
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm="7">
                                            <Container fluid>
                                                <Row>
                                                    <Col>
                                                        <strong>Combine filters by:</strong>&nbsp; <Form.Check inline disabled type="radio" name="filtersLogic" label="OR" defaultChecked/> <Form.Check inline type="radio" disabled name="filtersLogic" label="AND" />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        &nbsp;
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm="6">
                                                        <strong>Automatically flagged data types (SVMs)</strong>
                                                    </Col>
                                                    <Col sm="6">
                                                        <strong>Manually flagged data types</strong>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm="6">
                                                        <Form.Check type="checkbox" label="Anatomic expression data in WT condition"
                                                                    onChange={() => this.props.addRemFilterCallback("otherexpr", "svm")}/>
                                                        <Form.Check type="checkbox" label="Allele sequence change"
                                                                    onChange={() => this.props.addRemFilterCallback("seqchange", "svm")}/>
                                                        <Form.Check type="checkbox" label="Genetic interactions"
                                                                    onChange={() => this.props.addRemFilterCallback("geneint", "svm")}/>
                                                        <Form.Check type="checkbox" label="Physical interactions"
                                                                    onChange={() => this.props.addRemFilterCallback("geneprod", "svm")}/>
                                                        <Form.Check type="checkbox" label="Regulatory interactions"
                                                                    onChange={() => this.props.addRemFilterCallback("genereg", "svm")}/>
                                                        <Form.Check type="checkbox" label="Allele phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("newmutant", "svm")}/>
                                                        <Form.Check type="checkbox" label="RNAi phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("rnai", "svm")}/>
                                                        <Form.Check type="checkbox" label="Transgene overexpression phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("overexpr", "svm")}/>
                                                    </Col>
                                                    <Col sm="6">
                                                        <Form.Check type="checkbox" label="Gene model correction/update"
                                                                    onChange={() => this.props.addRemFilterCallback("structcorr", "manual")}/>
                                                        <Form.Check type="checkbox" label="Newly generated antibody"
                                                                    onChange={() => this.props.addRemFilterCallback("antibody", "manual")}/>
                                                        <Form.Check type="checkbox" label="Site of action data"
                                                                    onChange={() => this.props.addRemFilterCallback("siteaction", "manual")}/>
                                                        <Form.Check type="checkbox" label="Time of action data"
                                                                    onChange={() => this.props.addRemFilterCallback("timeaction", "manual")}/>
                                                        <Form.Check type="checkbox" label="RNAseq data"
                                                                    onChange={() => this.props.addRemFilterCallback("rnaseq", "manual")}/>
                                                        <Form.Check type="checkbox" label="Chemically induced phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("chemphen", "manual")}/>
                                                        <Form.Check type="checkbox" label="Environmental induced phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("envpheno", "manual")}/>
                                                        <Form.Check type="checkbox" label="Enzymatic activity"
                                                                    onChange={() => this.props.addRemFilterCallback("catalyticact", "manual")}/>
                                                        <Form.Check type="checkbox" label="Human disease model"
                                                                    onChange={() => this.props.addRemFilterCallback("humdis", "manual")}/>
                                                        <Form.Check type="checkbox" label="Additional type of expression data"
                                                                    onChange={() => this.props.addRemFilterCallback("additionalexpr", "manual")}/>
                                                    </Col>
                                                </Row>
                                            </Container>
                                        </Col>
                                        <Col sm="5">
                                            <Container fluid>
                                                <Row>
                                                    <Col sm="12">
                                                        <strong>Exclude papers already curated for the following data types</strong>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm="12">
                                                        <Form.Check type="checkbox" label="Anatomic expression data in WT condition"
                                                                    onChange={() => this.props.addRemFilterCallback("otherexpr", "curation")}/>
                                                        <Form.Check type="checkbox" label="Allele sequence change"
                                                                    onChange={() => this.props.addRemFilterCallback("seqchange", "curation")}/>
                                                        <Form.Check type="checkbox" label="Genetic interactions"
                                                                    onChange={() => this.props.addRemFilterCallback("geneint", "curation")}/>
                                                        <Form.Check type="checkbox" label="Physical interactions"
                                                                    onChange={() => this.props.addRemFilterCallback("geneprod", "curation")}/>
                                                        <Form.Check type="checkbox" label="Regulatory interactions"
                                                                    onChange={() => this.props.addRemFilterCallback("genereg", "curation")}/>
                                                        <Form.Check type="checkbox" label="Allele phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("newmutant", "curation")}/>
                                                        <Form.Check type="checkbox" label="RNAi phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("rnai", "curation")}/>
                                                        <Form.Check type="checkbox" label="Transgene overexpression phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("overexpr", "curation")}/>
                                                        <Form.Check type="checkbox" label="Gene model correction/update"
                                                                    onChange={() => this.props.addRemFilterCallback("structcorr", "curation")}/>
                                                        <Form.Check type="checkbox" label="Newly generated antibody"
                                                                    onChange={() => this.props.addRemFilterCallback("antibody", "curation")}/>
                                                        <Form.Check type="checkbox" label="Site of action data"
                                                                    onChange={() => this.props.addRemFilterCallback("siteaction", "curation")}/>
                                                        <Form.Check type="checkbox" label="Time of action data"
                                                                    onChange={() => this.props.addRemFilterCallback("timeaction", "curation")}/>
                                                        <Form.Check type="checkbox" label="RNAseq data"
                                                                    onChange={() => this.props.addRemFilterCallback("rnaseq", "curation")}/>
                                                        <Form.Check type="checkbox" label="Chemically induced phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("chemphen", "curation")}/>
                                                        <Form.Check type="checkbox" label="Environmental induced phenotype"
                                                                    onChange={() => this.props.addRemFilterCallback("envpheno", "curation")}/>
                                                        <Form.Check type="checkbox" label="Enzymatic activity"
                                                                    onChange={() => this.props.addRemFilterCallback("catalyticact", "curation")}/>
                                                        <Form.Check type="checkbox" label="Human disease model"
                                                                    onChange={() => this.props.addRemFilterCallback("humdis", "curation")}/>
                                                        <Form.Check type="checkbox" label="Additional type of expression data"
                                                                    onChange={() => this.props.addRemFilterCallback("additionalexpr", "curation")}/>
                                                    </Col>
                                                </Row>
                                            </Container>
                                        </Col>
                                    </Row>
                                </Container>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        &nbsp;
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default PapersFilters;