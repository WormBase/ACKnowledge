import React from 'react';
import {Image} from "react-bootstrap";
import Badge from "react-bootstrap/lib/Badge";

const Header = () => {
    return (
        <div className="container" style={{marginBottom: '5px'}}>
            <div className="row">
                <div className="col-sm-12">
                    <Image src="lockup-with-rule-color-100.jpg" width="100%" />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-10">
                </div>
                <div className="col-sm-2" align="right">
                    <Badge>Release {process.env.REACT_APP_VERSION}</Badge>
                </div>
            </div>
        </div>
    );
}

export default Header;
