import { call, put, select, takeLatest, ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapters from '../adapters';
import * as Events from '../events';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export default (flux: FluxCapacitor) => {
  function* fetchSuggestions(action: Actions.FetchAutocompleteSuggestions) {
    try {
      const state: Store.State = yield select();
      const res = yield call(
        [flux.clients.sayt, flux.clients.sayt.autocomplete],
        action.payload,
        Selectors.autocompleteSuggestionsRequest(flux.config)
      );
      const category = state.data.autocomplete.category.field;
      const suggestions = Adapters.Autocomplete.extractSuggestions(res, category);

      yield put(flux.actions.receiveAutocompleteSuggestions(suggestions));
    } catch (e) {
      yield put(flux.actions.receiveAutocompleteSuggestions(e));
    }
  }

  function* fetchProducts(action: Actions.FetchAutocompleteProducts) {
    try {
      const state: Store.State = yield select();
      const res = yield call(
        [flux.clients.sayt, flux.clients.sayt.productSearch],
        action.payload,
        Selectors.autocompleteProductsRequest(flux.config)
      );
      const products = Adapters.Autocomplete.extractProducts(res);

      yield put(flux.actions.receiveAutocompleteProducts(products));
    } catch (e) {
      yield put(flux.actions.receiveAutocompleteProducts(e));
    }
  }

  return function* saga() {
    yield takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, fetchSuggestions);
    yield takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, fetchProducts);
  };
};
