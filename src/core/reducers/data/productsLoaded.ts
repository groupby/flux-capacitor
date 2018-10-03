import Actions from '../../actions';
import Store from '../../store';
import Defaults from '../../store/data-defaults';

export type Action = Actions.ReceiveProductRecords;
export type State = boolean;

// todo: Refactor storefront to avoid this pattern
// currently used to avoid race conditions with components on initialization
export default function updateProductsLoaded(state: State = Defaults.productsLoaded, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_PRODUCT_RECORDS: return true;
    default: return state;
  }
}
