import * as redux from 'redux';
import Actions from '../actions';
import Store from '../store';

import data from './data';
import isFetching from './is-fetching';
import isRunning from './is-running';
import session from './session';
import ui from './ui';

export const rootReducer = redux.combineReducers<Store.State>({
  isRunning,
  isFetching,
  session,
  data,
  ui,
});

export default (state: any, action) => {
  switch (action.type) {
    case Actions.REFRESH_STATE: return action.state;
    default: return rootReducer(state, action);
  }
};
