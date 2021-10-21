export const SET_SELECTED_PAPER_ID = "SET_SELECTED_PAPER_ID";

export const setSelectedPaperID = (paperID) => ({
    type: SET_SELECTED_PAPER_ID,
    payload: { paperID }
});