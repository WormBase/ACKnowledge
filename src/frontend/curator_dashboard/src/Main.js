import React, {useState} from 'react';
import {withRouter} from "react-router-dom";
import LateralMenu from "./components/LateralMenu";
import PageArea from "./components/PageArea";
import {Button, Col, Container, Row} from "react-bootstrap";
import queryString from "query-string";
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "./redux/actions";

const Main = () => {
    const dispatch = useDispatch();
    const [menuCollapsed, setMenuCollapsed] = useState(true);
    let url = document.location.toString();
    if (url.match("\\?")) {
        dispatch(setSelectedPaperID(queryString.parse(document.location.search).paper_id));
    }
    return(
            <Container fluid>
                <Row>
                    {/* Mobile hamburger button */}
                    <div className="mobile-menu-toggle">
                        <Button 
                            onClick={() => setMenuCollapsed(!menuCollapsed)}
                            className="hamburger-btn"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </Button>
                    </div>
                    
                    {/* Overlay for mobile menu */}
                    <div 
                        className={`menu-overlay ${!menuCollapsed ? 'active' : ''}`}
                        onClick={() => setMenuCollapsed(true)}
                    ></div>
                    
                    <Col sm="2" id="lateralMenu" className={`${menuCollapsed ? 'collapsed' : 'expanded'}`}>
                        <LateralMenu onMenuItemClick={() => setMenuCollapsed(true)} />
                    </Col>
                    <Col sm="10">
                        <PageArea/>
                    </Col>
                </Row>
            </Container>
        );
}

export default withRouter(Main);