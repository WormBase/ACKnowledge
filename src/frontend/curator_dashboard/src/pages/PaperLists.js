import React, {useState} from 'react';
import {withRouter} from "react-router-dom";
import PapersFilters from "./paper_lists/PapersFilters";
import ListTabs from "./paper_lists/ListTabs";

const PaperLists = () => {
    const [numPapersPerPage, setNumPapersPerPage] = useState(10);

    return(
        <div>
            <PapersFilters setNumPapersPerPageCallback={(num) => setNumPapersPerPage(num)}
                           papersPerPage={numPapersPerPage} />
            <ListTabs/>
        </div>
    );
}

export default withRouter(PaperLists);
