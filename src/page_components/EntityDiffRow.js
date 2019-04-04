import React from 'react';

class EntityDiffRow extends React.Component {

    render() {
        return(
            <div>
                <div className="row">
                    <div className="col-sm-12">
                    <h4>{this.props.title}</h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                <li>Entity 1</li>
                                <li>Entity 2</li>
                            </ul>
                        </nav>
                    </div>
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                <li>Entity 1</li>
                                <li>Entity 3</li>
                            </ul>
                        </nav>
                    </div>
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                <li>Entity 3</li>
                            </ul>
                        </nav>
                    </div>
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                <li>Entity 2</li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }
}

export default EntityDiffRow;