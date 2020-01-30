import React from 'react';
import withPaginatedList from "../../components/paginated_lists/PaginatedList";
import AuthorListElement from "./AuthorListElement";

const PaginatedAuthorsList = withPaginatedList(AuthorListElement);
export default PaginatedAuthorsList;