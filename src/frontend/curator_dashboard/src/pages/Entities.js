import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {Tab, Tabs} from "react-bootstrap";
import PaginatedEntityList from "../components/paginated_lists/entities/PaginatedEntityList";

const Entities = () => {
    const elemPerPage = 10;
    return(
        <div>
            <Tabs defaultActiveKey="genes">
                <Tab eventKey="genes" title="Genes">
                    <Container fluid>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Added</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="gene" added={true} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="gene" added={false} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="species" title="Species">
                    <Container fluid>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Added</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="species" added={true} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="species" added={false} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="strains" title="Strains">
                    <Container fluid>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Added</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="strain" added={true} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="strain" added={false} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="alleles" title="Alleles">
                    <Container fluid>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Added</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="variation" added={true} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="variation" added={false} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="transgenes" title="Transgenes">
                    <Container fluid>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Added</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="transgenes" added={true} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList entityType="transgenes" added={false} numItemsPerPage={elemPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Tab>
            </Tabs>
        </div>
    );
}

export default Entities;