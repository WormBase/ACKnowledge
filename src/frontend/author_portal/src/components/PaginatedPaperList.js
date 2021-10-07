import React from "react";
import {useDispatch, useSelector} from "react-redux";
import withPaginatedList from "paginated-list";
import ListElement from "./ListElement";
import {listEndPoints, setError, setTotNumElements} from "../redux/actions/lists";
import PropTypes from "prop-types";
import axios from "axios";

const PaginatedPaperList = ({listType}) => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.login.token);

    const PaginatedList = withPaginatedList(ListElement, (offset, limit) => {
        return new Promise((resolve, reject) => {
            axios.post(listEndPoints[listType], {from: offset, count: limit, passwd: token})
                .then(res => {
                    dispatch(setTotNumElements(listType, res.data["total_num_ids"]));
                    resolve({
                        items: res.data["list_ids"],
                        totNumItems: res.data["total_num_ids"]
                    });
                })
                .catch((err) => {
                    dispatch(setError(err));
                });
        });
    }, 5, 5, false, false);

    return(
        <div>
            <PaginatedList />
        </div>
    );
}

PaginatedPaperList.propTypes = {
    listType: PropTypes.number
};

export default PaginatedPaperList;