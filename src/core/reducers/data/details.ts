import Actions from '../../actions';
import Store from '../../store';
import Defaults from '../../store/data-defaults';

export type Action = Actions.UpdateDetails;
export type State = Store.Details;

export default function updateDetails(state: State = Defaults.details, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_DETAILS: return update(state, action.payload);
    default: return state;
  }
}

export const update = (state: State, { data, template }: Store.Details) =>
  ({ ...state, data, template });
