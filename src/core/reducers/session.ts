import Actions from '../actions';
import Store from '../store';

export type Action = Actions.Action<string, any, { recallId: string, searchId: string }>;
export type State = Store.Session;

export default function updateSession(state: State = {}, action: Action): State {
  if (action.metadata) {
    if ('recallId' in action.metadata) {
      state = updateRecallId(state, action.metadata);
    }
    if ('searchId' in action.metadata) {
      state = updateSearchId(state, action.metadata);
    }
  }

  return state;
}

export const updateRecallId = (state: State, { recallId }) =>
  ({ ...state, recallId });

export const updateSearchId = (state: State, { searchId }) =>
  ({ ...state, searchId });
