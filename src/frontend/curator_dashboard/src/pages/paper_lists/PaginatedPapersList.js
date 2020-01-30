import React from 'react';
import PaperListElement from "./PaperListElement";
import withPaginatedList from "../../components/paginated_lists/PaginatedList";

const PaginatedPapersList = withPaginatedList(PaperListElement);
export default PaginatedPapersList;