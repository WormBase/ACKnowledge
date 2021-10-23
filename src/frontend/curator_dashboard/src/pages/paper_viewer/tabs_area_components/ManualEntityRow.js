import React from 'react';
import {ListGroup, ListGroupItem} from "react-bootstrap";

const ManualEntityRow = ({title, afpEntityList}) => {
    return(
        <div>
            <div className="row">
                <div className="col-sm-12">
                    <h6>{title}</h6>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <nav className="entityNav">
                        <ListGroup>
                            {[...afpEntityList].sort().map(item => <ListGroupItem>{item}</ListGroupItem>)}
                        </ListGroup>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default ManualEntityRow;