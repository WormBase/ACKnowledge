import React from 'react';
import {Link} from "react-router-dom";

class PaperListElement extends React.Component {
    render() {
        return (
            <Link to={{pathname: '/paper', search: '?paper_id=' + this.props.element}}>{this.props.element}</Link>
        );
    }
}

export default PaperListElement;