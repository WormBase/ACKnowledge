export const SET_COMMENTS = "SET_COMMENTS";
export const SET_OTHER_CC_CONTACTS = "SET_OTHER_CC_CONTACTS";
export const SET_IS_COMMENTS_SAVED_TO_DB = "SET_IS_COMMENTS_SAVED_TO_DB";


export const setComments = details => ({
    type: SET_COMMENTS,
    payload: {
        details
    }
});

export const setOtherCCContacts = details => ({
    type: SET_OTHER_CC_CONTACTS,
    payload: {
        details
    }
});

export const setIsCommentsSavedToDB = () => ({
    type: SET_IS_COMMENTS_SAVED_TO_DB,
    payload: {}
});