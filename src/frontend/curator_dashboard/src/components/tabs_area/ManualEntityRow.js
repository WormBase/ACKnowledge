import React from 'react';
import {ListGroup, ListGroupItem} from "react-bootstrap";

const ManualEntityRow = ({title, afpEntityList}) => {
    // Convert string to array if necessary, handling various cases
    let entityArray = [];
    if (afpEntityList) {
        if (typeof afpEntityList === 'string') {
            // Split by " | " separator and filter out empty strings
            entityArray = afpEntityList.split(' | ').filter(item => item && item.trim());
        } else if (Array.isArray(afpEntityList)) {
            entityArray = afpEntityList;
        }
    }
    
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
                            {entityArray.sort().map((item, index) => <ListGroupItem key={index}>{item}</ListGroupItem>)}
                        </ListGroup>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default ManualEntityRow;