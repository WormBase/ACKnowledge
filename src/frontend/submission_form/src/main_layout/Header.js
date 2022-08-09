import React from 'react';
import {Image} from "react-bootstrap";
import Badge from "react-bootstrap/lib/Badge";

const Header = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12">
                    <Image src="Lockup-with-Rule-RGB-Color-1920px.jpg" width="100%" />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-10">
                    &nbsp;
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
