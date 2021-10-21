import React, {useState} from "react";
import {Form, FormControl, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";
import Button from "react-bootstrap/Button";

const TopSearchBar = () => {
    const [paperID, setPaperID] = useState(undefined);
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                </Nav>
                <Form inline onSubmit={e => e.preventDefault()}>
                    <FormControl type="text" placeholder="Paper ID - 8 digits" className="mr-sm-2"
                                 onChange={(e) => {setPaperID(e.target.value)}} onSubmit=""
                                 onKeyPress={(target) => {if (target.key === 'Enter') {
                                     this.props.history.push('?paper_id=' + paperID);
                                     this.loadPaper()}}}/>
                    <Link to={
                        {
                            pathname: '/paper',
                            search: '?paper_id=' + this.state.paper_id
                        }
                    }><Button variant="outline-primary">Load Paper</Button></Link>
                </Form>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default TopSearchBar;