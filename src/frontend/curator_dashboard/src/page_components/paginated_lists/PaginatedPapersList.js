import React from 'react';
import PaperListElement from "./PaperListElement";
import withPaginatedList from "./PaginatedList";

const PaginatedPapersList = withPaginatedList(PaperListElement);
export default PaginatedPapersList;