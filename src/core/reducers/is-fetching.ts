import Actions from '../actions';
import Store from '../store';

export type Action = Actions.FetchMoreRefinements
  | Actions.ReceiveMoreRefinements
  | Actions.FetchMoreProducts
  | Actions.ReceiveMoreProducts
  | Actions.FetchProductsWithoutHistory
  | Actions.FetchProducts
  | Actions.ReceiveProducts
  | Actions.FetchAutocompleteSuggestions
  | Actions.ReceiveAutocompleteSuggestions
  | Actions.FetchAutocompleteProducts
  | Actions.ReceiveAutocompleteProducts
  | Actions.FetchProductDetails
  | Actions.ReceiveDetails;

export type State = Store.IsFetching;

export const DEFAULT_FETCHING = {
  moreRefinements: false,
  moreProducts: false,
  search: false,
  autocompleteSuggestions: false,
  autocompleteProducts: false,
  details: false,
};

export default function updateIsFetching(state: State = DEFAULT_FETCHING, action: Action): State {
  switch (action.type) {
    case Actions.FETCH_MORE_REFINEMENTS: return startFetching(state, 'moreRefinements');
    case Actions.RECEIVE_MORE_REFINEMENTS: return doneFetching(state, 'moreRefinements');
    case Actions.FETCH_MORE_PRODUCTS: return startFetching(state, 'moreProducts');
    case Actions.RECEIVE_MORE_PRODUCTS: return doneFetching(state, 'moreProducts');
    case Actions.FETCH_PRODUCTS_WITHOUT_HISTORY: return startFetching(state, 'search');
    case Actions.FETCH_PRODUCTS: return startFetching(state, 'search');
    case Actions.RECEIVE_PRODUCTS: return doneFetching(state, 'search');
    case Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS: return startFetching(state, 'autocompleteSuggestions');
    case Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS: return doneFetching(state, 'autocompleteSuggestions');
    case Actions.FETCH_AUTOCOMPLETE_PRODUCTS: return startFetching(state, 'autocompleteProducts');
    case Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS: return doneFetching(state, 'autocompleteProducts');
    case Actions.FETCH_PRODUCT_DETAILS: return startFetching(state, 'details');
    case Actions.RECEIVE_DETAILS: return doneFetching(state, 'details');
    default: return state;
  }
}

export const startFetching = (state: State, section: string) =>
  ({ ...state, [section]: true });

export const doneFetching = (state: State, section: string) =>
  ({ ...state, [section]: false });
