export function getPaperState(store) {
  return store.paper;
}

export const getPaperFetchError = store => getPaperState(store) ? getPaperState(store).loadError : null;
export const getPaperFetchIsLoading = store => getPaperState(store) ? getPaperState(store).isLoading : false;
