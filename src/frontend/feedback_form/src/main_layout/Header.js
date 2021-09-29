import React from 'react';
import {Image} from "react-bootstrap";
import Badge from "react-bootstrap/lib/Badge";

const Header = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-5">
                    <a href="https://wormbase.org"><Image src="logo_wormbase_gradient.svg" width="100%" /></a>
                </div>
                <div className="col-sm-5">
                    <Image src="logo_afp.svg" width="100%" />
                </div>
                <div className="col-sm-2" align="right">
                    <br/>
                    <Badge>Release {process.env.REACT_APP_VERSION}</Badge>
                </div>
            </div>
        </div>
    );
}

export default Header;
