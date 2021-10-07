import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import withPaginatedList from "paginated-list";
import ListElement from "./ListElement";
import {fetchPaperList, listTypes} from "../redux/actions/lists";
import PropTypes from "prop-types";

const PaginatedPaperList = ({listType}) => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.login.token);
    const paperList = useSelector((state) => state.lists.paperLists[listType]);
    const [curOffsetLimit, setCurOffsetLimit] = useState([0, 10]);

    useEffect(() => {
        dispatch(fetchPaperList(listType, curOffsetLimit[0], curOffsetLimit[1], token))
    }, [curOffsetLimit, token]);

    const PaginatedList = withPaginatedList(ListElement, (offset, limit) => {
        return new Promise((resolve, reject) => {
            if (offset !== curOffsetLimit[0] ||  limit !== curOffsetLimit[1]) {
                setCurOffsetLimit([offset, limit]);
            }
            resolve({
                items: paperList.elements,
                totNumItems: paperList.totNumElements
            });
        });
    }, 10, 5, false, false);

    return(
        <div>
            {paperList.isLoading ? <p>Loading...</p> : paperList.totNumElements > 0 ? <PaginatedList /> : null}
        </div>
    );
}

PaginatedPaperList.propTypes = {
    listType: PropTypes.number
};

export default PaginatedPaperList;