export function getPersonState(store) {
  return store.person;
}

export const getPerson = store => (getPersonState(store) ? getPersonState(store).person : {name: '', personId: undefined});
export const getPersonFetchError = store => getPersonState(store) ? getPersonState(store).loadError : null;
export const getPersonFetchIsLoading = store => getPersonState(store) ? getPersonState(store).isLoading : false;
