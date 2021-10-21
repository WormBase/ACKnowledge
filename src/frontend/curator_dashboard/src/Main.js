import React from 'react';
import {withRouter} from "react-router-dom";
import LateralMenu from "./components/LateralMenu";
import PageArea from "./components/PageArea";
import {Col, Container, Row} from "react-bootstrap";
import queryString from "query-string";
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "./redux/actions";

const Main = () => {
    const dispatch = useDispatch();
    let url = document.location.toString();
    if (url.match("\\?")) {
        dispatch(setSelectedPaperID(queryString.parse(document.location.search).paper_id));
    }
    return(
            <Container fluid>
                <Row>
                    <Col sm="2" id="lateralMenu">
                        <LateralMenu/>
                    </Col>
                    <Col sm="10">
                        <PageArea/>
                    </Col>
                </Row>
            </Container>
        );
}

export default withRouter(Main);