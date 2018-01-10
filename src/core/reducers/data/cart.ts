import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import Actions from '../../actions';
import Adapter from '../../adapters/cart';
import Selectors from '../../selectors';
import Store from '../../store';

export type Action = Actions.GetTrackerInfo
  | Actions.CartCreated
  | Actions.AddToCart
  | Actions.CartServerUpdated
  | Actions.ItemQuantityChanged
  | Actions.RemoveItem;

export type State = Store.Cart;

export const STORAGE_KEY = 'gb-cart';
export const STORAGE_WHITELIST = ['content'];

export const DEFAULTS: any = {
  content: {
    cartId: '',
    totalQuantity: 0,
    items: [],
    visitorId: '',
    sessionId: '',
    generatedTotalPrice: 0,
    lastModified: null,
  }
};

function updateCart(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.GET_TRACKER_INFO:
      return getTrackerInfo(state, action.payload);
    case Actions.ADD_TO_CART:
      return addToCart(state, action.payload);
    case Actions.CART_CREATED:
      return cartCreated(state, action.payload);
    case Actions.CART_SERVER_UPDATED:
      return updateWithServerData(state, action.payload);
    case Actions.ITEM_QUANTITY_CHANGED:
      return itemQuantityChanged(state, action.payload);
    case Actions.REMOVE_ITEM:
      return removeItem(state, action.payload);
    default:
      return state;
  }
}

export const getTrackerInfo = (state: State, { visitorId, sessionId }: Actions.Payload.Cart.TrackerInfo) =>
  ({
    ...state,
    content: { ...state.content, visitorId, sessionId }
  });

<<<<<<< HEAD
export const addToCart = (state: State, product: Actions.Payload.Cart.Product) => {
  const combinedItems = Adapter.combineLikeItems(state.content.items, product);

=======
export const addToCart = (state: State, product) => {
  const combinedItems = Adapter.combineLikeItems(state.content.items, product);
  
>>>>>>> 129837ccb60cb32ef117251fa5195ed12ae90816
  return {
    // tslint:disable-next-line:max-line-length
    ...state, content: { ...state.content, totalQuantity: Adapter.calculateTotalQuantity(combinedItems), items: combinedItems }
  };
};

export const cartCreated = (state: State, cartId: string) =>
  ({
    ...state, content: { ...state.content, cartId }
  });

// tslint:disable-next-line:max-line-length
export const updateWithServerData = (state: State, { generatedTotalPrice, totalQuantity, items, lastModified }: any) => ({
  ...state,
<<<<<<< HEAD
  content: {
=======
   content: {
>>>>>>> 129837ccb60cb32ef117251fa5195ed12ae90816
    ...state.content,
    totalQuantity,
    items,
    generatedTotalPrice,
    lastModified
  }
});

export const itemQuantityChanged = (state: State, { product, quantity }: any) => {
  const items = Adapter.changeItemQuantity(state.content.items, product, quantity);
  return {
    ...state,
    content: {
      ...state.content,
      items,
      totalQuantity: Adapter.calculateTotalQuantity(items)
    }
<<<<<<< HEAD
  };
=======
  }
>>>>>>> 129837ccb60cb32ef117251fa5195ed12ae90816
};

export const removeItem = (state: State, product: any) => {
  const { items } = state.content;
<<<<<<< HEAD
  const updatedItems = Adapter.removeItem(items, product);

  return {
    // tslint:disable-next-line:max-line-length
    ...state, content: { ...state.content, items: updatedItems, totalQuantity: Adapter.calculateTotalQuantity(updatedItems) }
  };
};

export default persistReducer({
  key: STORAGE_KEY, storage, whitelist: STORAGE_WHITELIST
=======
  const index = items.findIndex((item) => item.sku === product.sku)
  items.splice(index, 1);
  return {
    ...state, content: { ...state.content, items, totalQuantity: Adapter.calculateTotalQuantity(items) }
  };
};

const cartTransform = createTransform((state: State, key: string) => state, (state: State, key: string) => state);

export default persistReducer({
  transforms: [cartTransform], key: STORAGE_KEY, storage, whitelist: STORAGE_WHITELIST
>>>>>>> 129837ccb60cb32ef117251fa5195ed12ae90816
},
  updateCart);