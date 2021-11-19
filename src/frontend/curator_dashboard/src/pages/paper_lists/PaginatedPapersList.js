import React from "react";
import withPaginatedList from "paginated-list";
import PropTypes from "prop-types";
import axios from "axios";
import PaperListElement from "./PaperListElement";

const PaginatedEntityList = ({listType, svmFilters, manualFilters, curationFilters, combineFilters, numItemsPerPage}) => {
    const PaginatedList = withPaginatedList(PaperListElement, (offset, limit) => {
        return new Promise((resolve, reject) => {
            axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/papers",
                {from: offset, count: limit, list_type: listType, svm_filters: svmFilters,
                    manual_filters: manualFilters, curation_filters: curationFilters, combine_filters: combineFilters})
                .then(res => {
                    resolve({
                        items: res.data["list_elements"],
                        totNumItems: res.data["total_num_elements"]
                    });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }, numItemsPerPage, 5, false, true);

    return(
        <div>
            <PaginatedList />
        </div>
    );
}

PaginatedEntityList.defaultProps = {
    numItemsPerPage: 10
}

PaginatedEntityList.propTypes = {
    listType: PropTypes.oneOf(['processed', 'submitted', 'partial', 'empty']).isRequired,
    svmFilters: PropTypes.array,
    manualFilters: PropTypes.array,
    combineFilters: PropTypes.bool.isRequired
};

export default PaginatedEntityList;