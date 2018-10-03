import React from 'react';
import {Image} from "react-bootstrap";

class Title extends React.Component {

    render() {
        return (
            <div className="container">
                <div className="row header-row">
                    <div className="col-sm-5">
                        <a href="https://wormbase.org"><Image src="logo_wormbase_gradient.svg" width="100%" /></a>
                    </div>
                    <div className="col-sm-5">
                        <a href="https://wormbase.org"><Image src="logo_afp.svg" width="100%" /></a>
                    </div>
                </div>
            </div>
        );
    }
}

export default Title;