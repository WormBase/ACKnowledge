import React from 'react';
import withPaginatedList from "./PaginatedList";
import AuthorListElement from "./AuthorListElement";

const PaginatedAuthorsList = withPaginatedList(AuthorListElement);
export default PaginatedAuthorsList;