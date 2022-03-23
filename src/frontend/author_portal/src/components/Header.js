import React from 'react';
import {Image} from "react-bootstrap";

const Header = () => {
    return (
        <div>
            <br/>
            <a href="https://wormbase.org"><center><Image src="logo_wormbase_gradient.svg" width="20%" /></center></a>
            <center><h1 style={{color: "darkgray"}}>ACKnowledge - Author Curation Portal</h1></center>
        </div>
    );
}

export default Header;