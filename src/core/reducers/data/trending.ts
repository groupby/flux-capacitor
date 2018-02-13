import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveCustomFetchProducts;
// todo: change
export type State = Store.ProductWithMetadata[];

export default function updateProducts(state: any = [], action: Action) {
    switch (action.type) {
        case Actions.RECEIVE_CUSTOM_FETCH_PRODUCTS: return updateTrendingProducts(state, action);
        default: return state;
    }
}

export function updateTrendingProducts(state: any, { payload }: Action) {
    return [ ...state, ...payload ];
}
