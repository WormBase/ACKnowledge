import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {Jumbotron} from "react-bootstrap";

const PaperNotLoaded = () => {
    return (
      <div>
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
      </div>
    );
}

export default PaperNotLoaded;