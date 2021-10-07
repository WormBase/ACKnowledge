import React from "react";
import {listTypes} from "../redux/actions/lists";
import {useSelector} from "react-redux";
import {Badge} from "react-bootstrap";

const TabTitleWthNum = ({listType}) => {
    let totNumPapers;
    let title;
    let variant;
    switch (listType) {
        case listTypes.WAITING:
            totNumPapers = useSelector((state) => state.lists.totNumWaiting);
            title = "Waiting for submission";
            variant = "danger";
            break;
        case listTypes.PARTIAL:
            totNumPapers = useSelector((state) => state.lists.totNumPartial);
            title = "Partial submissions";
            variant = "warning";
            break;
        case listTypes.SUBMITTED:
            totNumPapers = useSelector((state) => state.lists.totNumSubmitted);
            title = "Completed submissions";
            variant = "success";
            break;
    }

    return (
        <span>{title} <Badge variant={variant}>{totNumPapers}</Badge></span>
    );
}

export default TabTitleWthNum;