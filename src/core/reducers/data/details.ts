import { Template } from 'groupby-api';
import Actions from '../../actions';
import SearchAdapter from '../../adapters/search';
import Store from '../../store';

export type Action = Actions.UpdateDetails | Actions.ReceiveDetails;
export type State = Store.Details;

export const DEFAULTS: State = {};

export default function updateDetails(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_DETAILS:
    case Actions.RECEIVE_DETAILS:
      return update(state, action.payload);
    default: return state;
  }
}

export const update = (state: State, { data, template }: Store.Details) =>
  ({ ...state, data, template: SearchAdapter.extractTemplate(<any>template) });
