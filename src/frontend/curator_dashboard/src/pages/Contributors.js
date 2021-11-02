import React, {useState} from 'react';
import {Card, Col, Container, Row,} from "react-bootstrap";
import PaginatedAuthorsList from "./contributors/PaginatedAuthorsList";
import NumElemPerPageSelector from "../components/paginated_lists/NumElemPerPageSelector";



const Contributors = () => {
    const [numItemsPerPage, setNumItemsPerPage] = useState(10);
    return(
        <Container fluid>
            <Row>
                <Col sm="12">
                    &nbsp;
                </Col>
            </Row>
            <Row>
                <Col sm="12">
                    <Container fluid>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Best contributors</Card.Header>
                                    <Card.Body>
                                        <PaginatedAuthorsList listType="contributors" numItemsPerPage={numItemsPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm="6">
                                <Card className="listPanel">
                                    <Card.Header>Most emailed</Card.Header>
                                    <Card.Body>
                                        <PaginatedAuthorsList listType="most_emailed" numItemsPerPage={numItemsPerPage}/>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
            <Row>
                <Col>
                    &nbsp;
                </Col>
            </Row>
            <Row>
                <Col>
                    <NumElemPerPageSelector setNumElemPerPageCallback={(numElem) => setNumItemsPerPage(numElem)}/>
                </Col>
            </Row>
        </Container>
    );
}

export default Contributors;
