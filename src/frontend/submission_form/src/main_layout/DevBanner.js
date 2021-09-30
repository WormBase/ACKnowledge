import React from "react";

const DevBanner = () => {
    return (
        <div>
            {process.env.NODE_ENV === "development" ?
                <div id="devBanner"><h3>Development Site</h3></div> : null
            }
        </div>
    )
}

export default DevBanner;