import React, {useState} from 'react';
import {Button, Col, Container, Form, FormControl, Row, Card} from "react-bootstrap";
import {Link, withRouter} from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSearch, faChartBar, faList, faUsers, faUserEdit} from '@fortawesome/free-solid-svg-icons'
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "../redux/actions";

const Home = () => {
    const dispatch = useDispatch();
    const [tmpPaperID, setTmpPaperID] = useState(undefined);
    let url = document.location.toString();
    let args = "";
    if (url.match('\\?')) {
        args = "?" + url.split('?')[1]
    }
    return(
        <Container fluid>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row>
                <Col sm="12">
                    <h2 className="text-center">Welcome to the ACKnowledge Admin Dashboard</h2>
                </Col>
            </Row>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row>
                <Col sm="1">
                    &nbsp;
                </Col>
                <Col sm="3">
                    <Card style={{ minHeight: '350px' }}>
                        <Card.Header>
                            <Link to={'/paper' + args}>
                                Paper Status Viewer
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <h1 className="text-center"><FontAwesomeIcon icon={faSearch}/></h1>
                            <Card.Text>
                                Check if a specific paper has been processed by ACKnowledge and see data submitted by authors
                            </Card.Text>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Load a Paper:</Form.Label>&nbsp;
                                <Form inline onSubmit={e => e.preventDefault()}>
                                    <FormControl type="text" placeholder="Paper ID - 8 digits" size="sm" style={{ width: '60%' }}
                                                 autoComplete="off"
                                                 onChange={(e) => setTmpPaperID(e.target.value)} onSubmit=""
                                                 onKeyPress={(target) => {if (target.key === 'Enter') { dispatch(setSelectedPaperID(tmpPaperID)) }}}/>
                                    <Button bsStyle="primary" size="sm" onClick={() => setSelectedPaperID(tmpPaperID)}>
                                        Load
                                    </Button>
                                </Form>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm="3">
                    <Card style={{ minHeight: '350px' }}>
                        <Card.Header>
                            <Link to={'/stats' + args}>
                                Overall Stats
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <h1 className="text-center"><FontAwesomeIcon icon={faChartBar}/></h1>
                            <Card.Text>
                                Get an overview of the papers processes by the pipeline and the author response rate
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm="3">
                    <Card style={{ minHeight: '350px' }}>
                        <Card.Header>
                            <Link to={'/papers_stats' + args}>
                                Extraction Stats
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <h1 className="text-center"><FontAwesomeIcon icon={faChartBar}/></h1>
                            <Card.Text>
                                Read statistics about the data extracted by ACKnowledge
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row><Col sm="12">&nbsp;</Col></Row>
            <Row>
                <Col sm="1">
                    &nbsp;
                </Col>
                <Col sm="3">
                    <Card style={{ minHeight: '350px' }}>
                        <Card.Header>
                            <Link to={'lists' + args}>
                                Paper Lists
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <h1 className="text-center"><FontAwesomeIcon icon={faList}/></h1>
                            <Card.Text>
                                Browse the papers processed by ACKnowledge and with data submitted by authors by navigating through dynamic lists
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm="3">
                    <Card style={{ minHeight: '350px' }}>
                        <Card.Header>
                            <Link to={'/contributors' + args}>
                                Contributors
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <h1 className="text-center"><FontAwesomeIcon icon={faUsers}/></h1>
                            <Card.Text>
                                Find the top contributors to ACKnowledge submissions and the authors who received more ACKnowledge
                                emails
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm="3">
                    <Card style={{ minHeight: '350px' }}>
                        <Card.Header>
                            <Link to={'/entities' + args}>
                                Entities Added/Removed
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            <h1 className="text-center"><FontAwesomeIcon icon={faUserEdit}/></h1>
                            <Card.Text>
                                Discover the entities most added or removed by authors
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default withRouter(Home);