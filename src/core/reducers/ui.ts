import { Action, Store } from '..';
import Actions = Action.UI;

export type State = Store.UI;

export default function updateUi(state: State = {}, action) {
  switch (action.type) {
    case Action.types.CREATE_COMPONENT_STATE: return createComponentState(state, action);
    case Action.types.REMOVE_COMPONENT_STATE: return removeComponentState(state, action);
    default: return state;
  }
}

export const createComponentState = (state: State, { tagName, id, state: tagState }: Actions.CreateComponentState) => {
  const tags = state[tagName] || {};
  const globalState = tags.global || {};
  const currentState = tags[id] || {};
  return {
    ...state,
    [tagName]: {
      ...tags, [id]: { ...globalState, ...currentState, ...tagState }
    }
  };
};

export const removeComponentState = (state: State, { tagName, id }: Actions.RemoveComponentState) => {
  return {
    ...state,
    [tagName]: {
      ...Object.keys(state[tagName])
        .filter((key) => key !== id)
        .reduce((tags, key) => Object.assign(tags, { [key]: state[tagName][key] }), {})
    }
  };
};
