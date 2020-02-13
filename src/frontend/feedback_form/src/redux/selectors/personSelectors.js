export function getPersonState(store) {
  return store.person;
}

export const getPerson = store => (getPersonState(store) ? getPersonState(store).person : {name: '', personId: undefined});
