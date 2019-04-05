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
                                {[...this.props.tfpEntitiesList].sort().map(item => <li>{item}</li>)}
                            </ul>
                        </nav>
                    </div>
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                {[...this.props.afpEntitiesList].sort().map(item => <li>{item}</li>)}
                            </ul>
                        </nav>
                    </div>
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                {[...this.props.afpEntitiesList].filter(x => !new Set([...this.props.tfpEntitiesList]).has(x)).sort().map(item => <li>{item}</li>)}
                            </ul>
                        </nav>
                    </div>
                    <div className="col-sm-3">
                        <nav className="entityNav">
                            <ul>
                                {[...this.props.tfpEntitiesList].filter(x => !new Set([...this.props.afpEntitiesList]).has(x)).sort().map(item => <li>{item}</li>)}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }
}

export default EntityDiffRow;