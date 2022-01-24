import React from "react";
import withPaginatedList from "paginated-list";
import PropTypes from "prop-types";
import axios from "axios";
import EntityListElement from "./EntityListElement";

const PaginatedEntityList = ({entityType, added, numItemsPerPage}) => {
    const PaginatedList = withPaginatedList(EntityListElement, (offset, limit) => {
        return new Promise((resolve, reject) => {
            axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entities_count",
                {from: offset, count: limit, entity_type: entityType, added: added})
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
    entityType: PropTypes.oneOf(['gene', 'species', 'strain', 'variation', 'transgenes']).isRequired,
    added: PropTypes.bool.isRequired,
    numItemsPerPage: PropTypes.number
};

export default PaginatedEntityList;