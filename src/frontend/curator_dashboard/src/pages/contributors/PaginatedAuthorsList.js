import React from "react";
import withPaginatedList from "paginated-list";
import AuthorListElement from "./AuthorListElement";
import PropTypes from "prop-types";
import axios from "axios";

const PaginatedAuthorsList = ({listType, numItemsPerPage}) => {
    const PaginatedList = withPaginatedList(AuthorListElement, (offset, limit) => {
        return new Promise((resolve, reject) => {
            axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/" + listType, {from: offset, count: limit})
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

PaginatedAuthorsList.defaultProps = {
    numItemsPerPage: 10
}

PaginatedAuthorsList.propTypes = {
    listType: PropTypes.oneOf(['contributors', 'most_emailed']).isRequired,
    numItemsPerPage: PropTypes.number
};

export default PaginatedAuthorsList;