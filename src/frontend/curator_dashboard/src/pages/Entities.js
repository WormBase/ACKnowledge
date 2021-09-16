import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {Tab, Tabs} from "react-bootstrap";
import PaginatedEntityList from "./entities/PaginatedEntityList";

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
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "gene",
                                                count: elemPerPage,
                                                added: true
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "gene",
                                                count: elemPerPage,
                                                added: false
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
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
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "species",
                                                count: elemPerPage,
                                                added: true
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "species",
                                                count: elemPerPage,
                                                added: false
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
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
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "strain",
                                                count: elemPerPage,
                                                added: true
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "strain",
                                                count: elemPerPage,
                                                added: false
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
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
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "variation",
                                                count: elemPerPage,
                                                added: true
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "variation",
                                                count: elemPerPage,
                                                added: false
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
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
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "transgenes",
                                                count: elemPerPage,
                                                added: true
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Removed</Card.Header>
                                    <Card.Body>
                                        <PaginatedEntityList
                                            endpoint={process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count"}
                                            payload={{
                                                entity_type: "transgenes",
                                                count: elemPerPage,
                                                added: false
                                            }}
                                            elemPerPage={elemPerPage}
                                        />
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