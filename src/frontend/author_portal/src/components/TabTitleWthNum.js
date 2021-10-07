import React from "react";
import {listTypes} from "../redux/actions/lists";
import {useSelector} from "react-redux";
import {Badge} from "react-bootstrap";

const TabTitleWthNum = ({listType}) => {
    let totNumPapers;
    let title;
    switch (listType) {
        case listTypes.WAITING:
            totNumPapers = useSelector((state) => state.lists.totNumWaiting);
            title = "Waiting for submission";
            break;
        case listTypes.PARTIAL:
            totNumPapers = useSelector((state) => state.lists.totNumPartial);
            title = "Partial submissions";
            break;
        case listTypes.SUBMITTED:
            totNumPapers = useSelector((state) => state.lists.totNumSubmitted);
            title = "Completed submissions"
            break;
    }

    return (
        <span>{title} <Badge variant="warning">{totNumPapers}</Badge></span>
    );
}

export default TabTitleWthNum;