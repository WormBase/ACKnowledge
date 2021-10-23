import React from 'react';
import {ListGroup, ListGroupItem} from "react-bootstrap";

const EntityDiffRow = ({title, afpEntitiesList, tfpEntitiesList}) => {
    let afpEntities = "";
    if (afpEntitiesList !== undefined) {
        afpEntities = [...afpEntitiesList].sort().map(item => <ListGroupItem>{item}</ListGroupItem>)
    }
    let afpAdded = "";
    if (afpEntitiesList !== undefined) {
        afpAdded = [...afpEntitiesList].filter(x => !new Set([...tfpEntitiesList]).has(x)).sort().map(item => <ListGroupItem>{item}</ListGroupItem>)
    }
    let afpRemoved = "";
    if (afpEntitiesList !== undefined) {
        afpRemoved = [...tfpEntitiesList].filter(x => !new Set([...afpEntitiesList]).has(x)).sort().map(item => <ListGroupItem>{item}</ListGroupItem>)
    }
    return(
        <div>
            <div className="row">
                <div className="col-sm-12">
                    <h6>{title}</h6>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-3">
                    <nav className="entityNav">
                        <ListGroup>
                            {[...tfpEntitiesList].sort().map(item => <ListGroupItem>{item}</ListGroupItem>)}
                        </ListGroup>
                    </nav>
                </div>
                <div className="col-sm-3">
                    <nav className="entityNav">
                        <ListGroup>
                            {afpEntities}
                        </ListGroup>
                    </nav>
                </div>
                <div className="col-sm-3">
                    <nav className="entityNav">
                        <ListGroup>
                            {afpAdded}
                        </ListGroup>
                    </nav>
                </div>
                <div className="col-sm-3">
                    <nav className="entityNav">
                        <ListGroup>
                            {afpRemoved}
                        </ListGroup>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default EntityDiffRow;