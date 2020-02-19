export const getCommentsState = store => store.comments;

export const getComments = store => getCommentsState(store) ? getCommentsState(store).comments : {checked: false, details: ''};

export const isCommentsSavedToDB = store => getCommentsState(store) ? getCommentsState(store).isSavedToDB : false;