import React from 'react';
import {ListGroup, ListGroupItem} from "react-bootstrap";

class EntityDiffRow extends React.Component {

    render() {
        let afpEntities = "";
        if (this.props.afpEntitiesList !== undefined) {
            afpEntities = [...this.props.afpEntitiesList].sort().map(item => <ListGroupItem>{item}</ListGroupItem>)
        }
        let afpAdded = "";
        if (this.props.afpEntitiesList !== undefined) {
            afpAdded = [...this.props.afpEntitiesList].filter(x => !new Set([...this.props.tfpEntitiesList]).has(x)).sort().map(item => <ListGroupItem>{item}</ListGroupItem>)
        }
        let afpRemoved = "";
        if (this.props.afpEntitiesList !== undefined) {
            afpRemoved = [...this.props.tfpEntitiesList].filter(x => !new Set([...this.props.afpEntitiesList]).has(x)).sort().map(item => <ListGroupItem>{item}</ListGroupItem>)
        }
        return(
            <div>
                <div className="row">
                    <div className="col-sm-12">
                    <h6>{this.props.title}</h6>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ListGroup>
                                {[...this.props.tfpEntitiesList].sort().map(item => <ListGroupItem>{item}</ListGroupItem>)}
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
}

export default EntityDiffRow;