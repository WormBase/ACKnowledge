import React from 'react';
import {
    Button, Col, Container,
    Form,
    FormControl, Row
} from "react-bootstrap";
import {Link, withRouter} from "react-router-dom";
import Card from "react-bootstrap/es/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faChartBar, faList } from '@fortawesome/free-solid-svg-icons'

class Home extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            paper_id: undefined
        };
    }

    render() {
        let url = document.location.toString();
        let args = "";
        if (url.match('\\?')) {
            args = "?" + url.split('?')[1]
        }
        return(
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
                    <Col sm="12">
                        <h2 className="text-center">Welcome to the Author First Pass Admin Dashboard!</h2>
                    </Col>
                </Row>
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
                    <Col sm="12">
                        <h5 className="text-center">The dashboard includes the following pages:</h5>
                    </Col>
                </Row>
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
                    <Col sm="1">
                        &nbsp;
                    </Col>
                    <Col sm="3">
                        <Card style={{ height: '300px' }}>
                            <Card.Header>
                                <Link to={'/paper' + args}>
                                    Paper Status Viewer
                                </Link>
                            </Card.Header>
                            <Card.Body>
                                <h1 className="text-center"><FontAwesomeIcon icon={faSearch}/></h1>
                                <Card.Text>
                                    Check if a specific paper has been processed by the AFP and see data submitted by authors
                                </Card.Text>
                                <Form inline onSubmit={e => e.preventDefault()}>
                                    <Form.Label>Load a Paper:</Form.Label>&nbsp;
                                    <FormControl type="text" placeholder="Paper ID - 8 digits" size="sm"
                                                 onChange={(e) => {this.setState({paper_id: e.target.value})}} onSubmit=""
                                                 onKeyPress={(target) => {if (target.key === 'Enter') { this.props.history.push("/paper?paper_id=" + this.state.paper_id)  }}}/>
                                    <Link to={
                                        {
                                            pathname: '/paper',
                                            search: '?paper_id=' + this.state.paper_id
                                        }
                                    }><Button bsStyle="primary" size="sm">
                                        Load
                                    </Button></Link>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="3">
                        <Card style={{ height: '300px' }}>
                            <Card.Header>
                                <Link to={'/stats' + args}>
                                    Overall Stats
                                </Link>
                            </Card.Header>
                            <Card.Body>
                                <h1 className="text-center"><FontAwesomeIcon icon={faChartBar}/></h1>
                                <Card.Text>
                                    Get an overview of the data extracted by the AFP
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="3">
                        <Card style={{ height: '300px' }}>
                            <Card.Header>
                                <Link to={'lists' + args}>
                                    Paper Lists
                                </Link>
                            </Card.Header>
                            <Card.Body>
                                <h1 className="text-center"><FontAwesomeIcon icon={faList}/></h1>
                                <Card.Text>
                                    Browse the papers processed by the AFP and with data submitted by authors by navigating through dynamic lists
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm="2">
                        &nbsp;
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(Home);