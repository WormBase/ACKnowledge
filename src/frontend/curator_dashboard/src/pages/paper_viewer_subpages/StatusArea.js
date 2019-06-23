import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {Badge, Card, Col, Container, Jumbotron, Row} from "react-bootstrap";
import TabsArea from "./TabsArea";


class StatusArea extends React.Component {

    render() {
        let link_to_afp_form = "";
        if (this.props.link_to_afp_form !== "") {
            link_to_afp_form =
                <Card>
                    <Card.Header>Link to AFP submission form</Card.Header>
                    <Card.Body><a href={this.props.link_to_afp_form} target="_blank">{this.props.link_to_afp_form}</a></Card.Body>
                </Card>
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
                                    <Card.Body><strong>Title:</strong> &nbsp; {this.props.paper_title}<br/>
                                        <strong>Journal:</strong> &nbsp; {this.props.paper_journal}<br/>
                                        <strong>Email:</strong> &nbsp; {this.props.email} <br/>
                                        <strong>Link to pubmed source:</strong> &nbsp; <a href={"https://www.ncbi.nlm.nih.gov/pubmed/" + this.props.pmid} target="blank_">{"https://www.ncbi.nlm.nih.gov/pubmed/" + this.props.pmid}</a> <br/>
                                        <strong>Link to doi source:</strong> &nbsp; <a href={"https://doi.org/" + this.props.doi} target="blank_">{"https://doi.org/" + this.props.doi}</a>
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
                                        Final data submitted by author: &nbsp; <Badge variant="secondary">{this.props.paper_author_submitted}</Badge><br/>
                                        Author has modified any data (including partial submissions): &nbsp; <Badge variant="secondary">{this.props.paper_author_modified}</Badge>
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
                                {link_to_afp_form}
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
