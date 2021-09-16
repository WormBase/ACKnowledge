import React from 'react';
import withPaginatedList from "../../components/paginated_lists/PaginatedList";
import EntityListElement from "./EntityListElement";

const PaginatedEntityList = withPaginatedList(EntityListElement);
export default PaginatedEntityList;