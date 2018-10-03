import Actions from '../../actions';
import Defaults from '../../store/data-defaults';

export type Action = Actions.ReceiveRedirect;
export type State = string;

export default function updateRedirect(state: State = Defaults.redirect, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_REDIRECT: return action.payload;
    default: return state;
  }
}
