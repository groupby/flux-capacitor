import Actions from '../actions';
import Store from '../store';

export type Action = Actions.FETCH_MORE_REFINEMENTS
  | Actions.FETCH_MORE_PRODUCTS
  | Actions.FETCH_PRODUCTS
  | Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS
  | Actions.FETCH_AUTOCOMPLETE_PRODUCTS
  | Actions.FETCH_PRODUCT_DETAILS;

export type State = {
  moreRefinements: boolean;
  moreProducts: boolean;
  search: boolean;
  autocompleteSuggestions: boolean;
  autocompleteProducts: boolean;
  details: boolean;
};

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
    case Actions.FETCH_MORE_REFINEMENTS: return { ...state, moreRefinements: true };
    case Actions.FETCH_MORE_PRODUCTS: return { ...state, moreProducts: true };
    case Actions.FETCH_PRODUCTS: return { ...state, search: true };
    case Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS: return { ...state, autocompleteSuggestions: true };
    case Actions.FETCH_AUTOCOMPLETE_PRODUCTS: return { ...state, autocompleteProducts: true };
    case Actions.FETCH_PRODUCT_DETAILS: return { ...state, details: true };
    default: return state;
  }
}
