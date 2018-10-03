import Actions from '../../actions';
import Store from '../../store';
import Defaults from '../../store/data-defaults';

export type Action = Actions.SelectCollection | Actions.ReceiveCollectionCount;
export type State = Store.Indexed.Selectable<Store.Collection>;

export default function updateCollections(state: State = Defaults.collections, action: Action): State {
  switch (action.type) {
    case Actions.SELECT_COLLECTION: return updateSelected(state, action.payload);
    case Actions.RECEIVE_COLLECTION_COUNT: return receiveCount(state, action.payload);
    default: return state;
  }
}

export const updateSelected = (state: State, selected: string) =>
  ({ ...state, selected });

export const receiveCount = (state: State, { collection, count: total }: Actions.Payload.Collection.Count) =>
  ({
    ...state,
    byId: {
      ...state.byId,
      [collection]: { ...state.byId[collection], total },
    },
  });
