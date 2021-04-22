export function getPaperState(store) {
  return store.paper.paperData;
}

export const getPaperFetchError = store => getPaperState(store) ? getPaperState(store).loadError : null;
export const getPaperFetchIsLoading = store => getPaperState(store) ? getPaperState(store).isLoading : false;
export const getPaperPassword = store => {
  if (getPaperState(store)) {
    return getPaperState(store).paperPasswd
  } else {
    return undefined;
  }
}
export const getPaperId = store => getPaperState(store) ? getPaperState(store).paperId : undefined;
