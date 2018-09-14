import Actions from '../../actions';
import Store from '../../store';
import Defaults from '../../store/data-defaults';

export type Action = Actions.ReceiveInfiniteScroll;
export type State = Store.InfiniteScroll;

export default function updateInfiniteScroll(state: State = Defaults.infiniteScroll, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_INFINITE_SCROLL: return updateFetching(state, action.payload);
    default: return state;
  }
}

// tslint:disable-next-line max-line-length
export const updateFetching = (state: State, { isFetchingForward = state.isFetchingForward, isFetchingBackward = state.isFetchingBackward }) =>
  ({ ...state, isFetchingForward, isFetchingBackward });
