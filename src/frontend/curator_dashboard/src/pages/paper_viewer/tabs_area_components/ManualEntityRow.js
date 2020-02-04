import React from 'react';
import {ListGroup, ListGroupItem} from "react-bootstrap";

class ManualEntityRow extends React.Component {

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-sm-12">
                    <h6>{this.props.title}</h6>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <nav className="entityNav">
                            <ListGroup>
                                {[...this.props.afpEntityList].sort().map(item => <ListGroupItem>{item}</ListGroupItem>)}
                            </ListGroup>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }
}

export default ManualEntityRow;