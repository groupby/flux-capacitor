import Actions from './actions';
import SearchAdapter from './adapters/search';
import Selectors from './selectors';
import Store from './store';

export interface Validator<T = any> {
  func: (payload?: T, state?: Store.State) => boolean;
  msg: string;
}

export const isString: Validator<string> = {
  func: (value: any) => typeof value === 'string' && value.trim().length !== 0,
  msg: 'must be a non-empty string'
};

export const isValidQuery: Validator<string> = {
  func: (query) => !!query || query === null,
  msg: 'search term is empty'
};

export const isDifferentQuery: Validator<string> = {
  func: (query, state) => query !== Selectors.query(state),
  msg: 'search term is not different'
};

export const isRangeRefinement: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: ({ range, low, high }) => !range || (typeof low === 'number' && typeof high === 'number'),
  msg: 'low and high values must be numeric'
};

export const isValueRefinement: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: ({ range, value }) => !!range || isString.func(value),
  msg: `value ${isString.msg}`
};

export const isRefinementDeselectedByValue: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: (payload, state) => {
    const navigation = Selectors.navigation(state, payload.navigationId);
    // tslint:disable-next-line max-line-length
    return !navigation || navigation.selected
      .findIndex((index) => SearchAdapter.refinementsMatch(<any>payload, <any>navigation.refinements[index], navigation.range ? 'Range' : 'Value')) === -1;
  },
  msg: 'refinement is already selected'
};

export const isValidRange: Validator<Actions.Payload.Navigation.AddRefinement> = {
  func: ({ range, low, high }) => !range || low < high,
  msg: 'low value must be lower than high'
};

export const isValidClearField: Validator<string | boolean> = {
  func: (field) => field === true || typeof field === 'string',
  msg: 'clear must be a string or true'
};

export const hasSelectedRefinements: Validator = {
  func: (_, state) => Selectors.selectedRefinements(state).length !== 0,
  msg: 'no refinements to clear'
};

export const hasSelectedRefinementsByField: Validator<string> = {
  // tslint:disable-next-line max-line-length
  func: (field, state) => typeof field === 'boolean' || Selectors.navigation(state, field).selected.length !== 0,
  msg: 'no refinements to clear for field'
};

export const notOnFirstPage: Validator = {
  func: (_, state) => Selectors.page(state) !== 1,
  msg: 'page must not be on first page'
};
