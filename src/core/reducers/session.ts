import Actions from '../actions';
import Store from '../store';

export type Action = Actions.Action<string, any, Actions.Metadata>;
export type State = Store.Session;

export default function updateSession(state: State = {}, action: Action): State {
  if ('metadata' in action) {
    if ('recallId' in action.metadata) {
      state = updateRecallId(state, action.metadata);
    }
    if ('searchId' in action.metadata) {
      state = updateSearchId(state, action.metadata);
    }
    if ('tag' in action.metadata) {
      state = updateOrigin(state, action.metadata);
    }
  }

  return state;
}

export const updateRecallId = (state: State, { recallId }: Actions.Metadata) =>
  ({ ...state, recallId });

export const updateSearchId = (state: State, { searchId }: Actions.Metadata) =>
  ({ ...state, searchId });

export const updateOrigin = (state: State, { tag: origin }: Actions.Metadata) =>
  ({ ...state, origin });
