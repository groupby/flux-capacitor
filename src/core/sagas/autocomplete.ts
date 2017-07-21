import 'isomorphic-fetch';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/autocomplete';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

declare function fetch();

const SUGGESTION_MODES = {
  popular: 'Popular',
  trending: 'Trending',
  recent: 'Recent'
};

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchSuggestions(flux: FluxCapacitor, { payload: { query, location } }: Actions.FetchAutocompleteSuggestions) {
    try {
      const field = yield effects.select(Selectors.autocompleteCategoryField);
      const suggestionsRequest = effects.call(
        [flux.clients.sayt, flux.clients.sayt.autocomplete],
        query,
        Selectors.autocompleteSuggestionsRequest(flux.config)
      );
      const recommendations = flux.config.autocomplete.recommendations;
      const suggestionMode = SUGGESTION_MODES[recommendations.suggestionMode || 'popular'];
      // tslint:disable-next-line max-line-length
      const trendingUrl = `https://${flux.config.customerId}.groupbycloud.com/wisdom/v2/public/recommendations/searches/_get${suggestionMode}`;
      const trendingBody: any = {
        size: recommendations.suggestionCount,
        matchPartial: {
          and: [{
            search: { query }
          }]
        }
      };
      if (location && recommendations.location) {
        trendingBody.matchExact = {
          and: [{
            visit: {
              generated: {
                geo: {
                  country: 'us',
                  region: 'ny'
                }
              }
            }
          }]
        };
      }
      const trendingRequest = effects.call(fetch, trendingUrl, {
        method: 'POST',
        body: JSON.stringify(trendingBody)
      });
      const [results, trending] = yield effects.all([suggestionsRequest, trendingRequest]);
      const autocompleteSuggestions = Adapter.extractSuggestions(results, field);
      const trendingSuggestions = Adapter.mergeSuggestions(autocompleteSuggestions.suggestions, yield trending.json());

      yield effects.put(flux.actions.receiveAutocompleteSuggestions({
        ...autocompleteSuggestions,
        suggestions: trendingSuggestions
      }));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteSuggestions(e));
    }
  }

  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchAutocompleteProducts) {
    try {
      const res = yield effects.call(
        [flux.clients.sayt, flux.clients.sayt.productSearch],
        action.payload,
        Selectors.autocompleteProductsRequest(flux.config)
      );
      const products = Adapter.extractProducts(res);

      yield effects.put(flux.actions.receiveAutocompleteProducts(products));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* autocompleteSaga() {
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux);
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux);
};
