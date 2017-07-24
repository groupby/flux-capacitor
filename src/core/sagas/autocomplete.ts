import 'isomorphic-fetch';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/autocomplete';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

declare function fetch();

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchSuggestions(flux: FluxCapacitor, { payload: query }: Actions.FetchAutocompleteSuggestions) {
    try {
      const state = yield effects.select();
      const field = Selectors.autocompleteCategoryField(state);
      const location = Selectors.location(state);
      const suggestionsRequest = effects.call(
        [flux.clients.sayt, flux.clients.sayt.autocomplete],
        query,
        Selectors.autocompleteSuggestionsRequest(flux.config)
      );
      const config = flux.config.autocomplete.recommendations;
      const suggestionMode = Configuration.RECOMMENDATION_MODES[config.suggestionMode || 'popular'];
      // tslint:disable-next-line max-line-length
      const trendingUrl = `https://${flux.config.customerId}.groupbycloud.com/wisdom/v2/public/recommendations/searches/_get${suggestionMode}`;
      const trendingBody: any = {
        size: config.suggestionCount,
        matchPartial: {
          and: [{
            search: { query }
          }]
        }
      };
      if (location && config.location) {
        trendingBody.matchExact = {
          and: [{
            visit: {
              generated: {
                geo: {
                  location: {
                    distance: '100km',
                    center: {
                      lat: location.latitude,
                      lon: location.longitude
                    }
                  }
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
