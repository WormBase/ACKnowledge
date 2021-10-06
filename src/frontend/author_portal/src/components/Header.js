import React from 'react';
import {Image} from "react-bootstrap";

const Header = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-1">
                    &nbsp;
                </div>
            </div>
            <div className="row">
                <div className="col-sm-1">
                    &nbsp;
                </div>
                <div className="col-sm-5">
                    <a href="https://wormbase.org"><Image src="logo_wormbase_gradient.svg" width="100%" /></a>
                </div>
                <div className="col-sm-5">
                    <Image src="logo_afp.svg" width="100%" />
                </div>
                <div className="col-sm-1">
                    &nbsp;
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <center><h1 style={{color: "darkgray"}}>Author Curation Portal</h1></center>
                </div>
            </div>
        </div>
    );
}

export default Header;