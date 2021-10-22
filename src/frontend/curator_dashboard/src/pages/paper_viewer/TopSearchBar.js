import React, {useState} from "react";
import {Form, FormControl, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";
import Button from "react-bootstrap/Button";
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "../../redux/actions";

const TopSearchBar = () => {
    const dispatch = useDispatch();
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
                                     dispatch(setSelectedPaperID(paperID));
                                 }}}/>
                    <Link to={
                        {
                            pathname: '/paper',
                            search: '?paper_id=' + paperID
                        }
                    }><Button variant="outline-primary">Load Paper</Button></Link>
                </Form>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default TopSearchBar;