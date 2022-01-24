import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import NumElemPerPageSelector from "../../components/NumElemPerPageSelector";
import {useDispatch, useSelector} from "react-redux";
import {resetPaperListFilters, setCombineFiltersBy, togglePaperListFilter} from "../../redux/actions";
import Collapse from "react-bootstrap/Collapse";
import {Button} from "react-bootstrap";

const PapersFilters = ({papersPerPage, setNumPapersPerPageCallback}) => {

    const dispatch = useDispatch();
    const paperListFilters = useSelector((state) => state.paperListFilters);
    const [showFilter, setShowFilter] = useState(false);

    return (
        <div>
            <br/>
            <Button onClick={() => setShowFilter(!showFilter)} aria-controls="example-collapse-text"
                    variant="outline-primary" size="sm" aria-expanded={showFilter}>
                {showFilter ? "Hide filters and options" : "Show filters and options"}
            </Button>&nbsp;
            <Button onClick={() => dispatch(resetPaperListFilters())} aria-controls="example-collapse-text"
                    variant="outline-primary" size="sm">Reset filters
            </Button>
            <br/>
            <br/>
            <Collapse in={showFilter}>
                <div>
                    <Card border="secondary">
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
                                            <strong>gene: TFIDF 10, protein: TFIDF 10, allele: TFIDF 5, strain: 1, species: 10, transgene: 1</strong>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm="6">
                                    <Card>
                                        <Card.Header>Page Options</Card.Header>
                                        <Card.Body>
                                            <NumElemPerPageSelector papersPerPage={papersPerPage} setNumElemPerPageCallback={setNumPapersPerPageCallback}/>
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
                                                                    <strong>Combine filters by:</strong>&nbsp;
                                                                    <Form.Check inline type="radio" name="filtersLogic"
                                                                                onChange={() => dispatch(setCombineFiltersBy('OR'))}
                                                                                checked={paperListFilters.combineFilters === "OR"}
                                                                                label="OR"/>
                                                                    <Form.Check inline type="radio" name="filtersLogic"
                                                                                onChange={() => dispatch(setCombineFiltersBy('AND'))}
                                                                                checked={paperListFilters.combineFilters === "AND"}
                                                                                label="AND" defaultChecked/>
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
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("otherexpr")} type="checkbox" label="Anatomic expression data in WT condition"
                                                                                onChange={() => dispatch(togglePaperListFilter("otherexpr", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("seqchange")} type="checkbox" label="Allele sequence change"
                                                                                onChange={() => dispatch(togglePaperListFilter("seqchange", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("geneint")} type="checkbox" label="Genetic interactions"
                                                                                onChange={() => dispatch(togglePaperListFilter("geneint", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("geneprod")} type="checkbox" label="Physical interactions"
                                                                                onChange={() => dispatch(togglePaperListFilter("geneprod", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("genereg")} type="checkbox" label="Regulatory interactions"
                                                                                onChange={() => dispatch(togglePaperListFilter("genereg", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("newmutant")} type="checkbox" label="Allele phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("newmutant", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("rnai")} type="checkbox" label="RNAi phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("rnai", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("overexpr")} type="checkbox" label="Transgene overexpression phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("overexpr", "svm"))}/>
                                                                    <Form.Check checked={paperListFilters.svmFilters.has("catalyticact")} type="checkbox" label="Enzymatic activity"
                                                                                onChange={() => dispatch(togglePaperListFilter("catalyticact", "svm"))}/>
                                                                </Col>
                                                                <Col sm="6">
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("structcorr")} type="checkbox" label="Gene model correction/update"
                                                                                onChange={() => dispatch(togglePaperListFilter("structcorr", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("antibody")} type="checkbox" label="Newly generated antibody"
                                                                                onChange={() => dispatch(togglePaperListFilter("antibody", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("siteaction")} type="checkbox" label="Site of action data"
                                                                                onChange={() => dispatch(togglePaperListFilter("siteaction", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("timeaction")} type="checkbox" label="Time of action data"
                                                                                onChange={() => dispatch(togglePaperListFilter("timeaction", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("rnaseq")} type="checkbox" label="RNAseq data"
                                                                                onChange={() => dispatch(togglePaperListFilter("rnaseq", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("chemphen")} type="checkbox" label="Chemically induced phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("chemphen", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("envpheno")} type="checkbox" label="Environmental induced phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("envpheno", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("humdis")} type="checkbox" label="Human disease model"
                                                                                onChange={() => dispatch(togglePaperListFilter("humdis", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("additionalexpr")} type="checkbox" label="Additional type of expression data"
                                                                                onChange={() => dispatch(togglePaperListFilter("additionalexpr", "manual"))}/>
                                                                    <Form.Check checked={paperListFilters.manualFilters.has("othergenefunc")} type="checkbox" label="Other gene function"
                                                                                onChange={() => dispatch(togglePaperListFilter("othergenefunc", "manual"))}/>
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
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("otherexpr")} type="checkbox" label="Anatomic expression data in WT condition"
                                                                                onChange={() => dispatch(togglePaperListFilter("otherexpr", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("seqchange")} type="checkbox" label="Allele sequence change"
                                                                                onChange={() => dispatch(togglePaperListFilter("seqchange", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("geneint")} type="checkbox" label="Genetic interactions"
                                                                                onChange={() => dispatch(togglePaperListFilter("geneint", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("geneprod")} type="checkbox" label="Physical interactions"
                                                                                onChange={() => dispatch(togglePaperListFilter("geneprod", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("genereg")} type="checkbox" label="Regulatory interactions"
                                                                                onChange={() => dispatch(togglePaperListFilter("genereg", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("newmutant")} type="checkbox" label="Allele phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("newmutant", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("rnai")} type="checkbox" label="RNAi phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("rnai", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("overexpr")} type="checkbox" label="Transgene overexpression phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("overexpr", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("structcorr")} type="checkbox" label="Gene model correction/update"
                                                                                onChange={() => dispatch(togglePaperListFilter("structcorr", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("antibody")} type="checkbox" label="Newly generated antibody"
                                                                                onChange={() => dispatch(togglePaperListFilter("antibody", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("siteaction")} type="checkbox" label="Site of action data"
                                                                                onChange={() => dispatch(togglePaperListFilter("siteaction", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("timeaction")} type="checkbox" label="Time of action data"
                                                                                onChange={() => dispatch(togglePaperListFilter("timeaction", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("rnaseq")} type="checkbox" label="RNAseq data"
                                                                                onChange={() => dispatch(togglePaperListFilter("rnaseq", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("chemphen")} type="checkbox" label="Chemically induced phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("chemphen", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("envpheno")} type="checkbox" label="Environmental induced phenotype"
                                                                                onChange={() => dispatch(togglePaperListFilter("envpheno", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("catalyticact")} type="checkbox" label="Enzymatic activity"
                                                                                onChange={() => dispatch(togglePaperListFilter("catalyticact", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("humdis")} type="checkbox" label="Human disease model"
                                                                                onChange={() => dispatch(togglePaperListFilter("humdis", "curation"))}/>
                                                                    <Form.Check checked={paperListFilters.curationFilters.has("additionalexpr")} type="checkbox" label="Additional type of expression data"
                                                                                onChange={() => dispatch(togglePaperListFilter("additionalexpr", "curation"))}/>
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
                    </Card>
                    <br/>
                </div>
            </Collapse>
        </div>
    );
}

export default PapersFilters;
