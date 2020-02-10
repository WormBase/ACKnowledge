export const getElementsState = store => store.elements;

export const getAllElementIds = store =>
    getElementsState(store) ? getElementsState(store).allIds : [];

export const getElementById = (store, id) =>
    getElementsState(store) ? { ...getElementsState(store).byIds[id], id } : {};

export const getAllElements = store =>
    getAllElementIds(store).map(id => getElementById(store, id));

export const getElementsMatchingString = (store, searchString) => {
  return getAllElements(store).filter(element => element.content.startsWith(searchString));
};