import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/autocomplete';
import ConfigAdapter from '../adapters/configuration';
import RecommendationsAdapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import RequestHelpers from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import { fetch } from '../utils';
import Requests from './requests';

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchSuggestions(flux: FluxCapacitor, { payload: query }: Actions.FetchAutocompleteSuggestions) {
    try {
      const state = yield effects.select();
      const config = yield effects.select(Selectors.config);
      const field = Selectors.autocompleteCategoryField(state);
      const suggestionsRequest = effects.call(
        Requests.autocomplete,
        flux,
        query,
        RequestHelpers.autocompleteSuggestions(config)
      );

      const recommendationsConfig = config.autocomplete.recommendations;
      // tslint:disable-next-line max-line-length
      const trendingBody = {
        size: recommendationsConfig.suggestionCount,
        matchPartial: {
          and: [{
            search: { query }
          }]
        }
      };
      const trendingRequest = effects.call(
        Requests.recommendations,
        {
          customerId: config.customerId,
          endpoint: 'searches',
          // fall back to default mode "popular" if not provided
          // "popular" default will likely provide the most consistently strong data
          mode: Configuration.RECOMMENDATION_MODES[recommendationsConfig.suggestionMode || 'popular'],
          body: RecommendationsAdapter.addLocationToRequest(trendingBody, state)
        }
      );
      const requests = [suggestionsRequest];
      if (recommendationsConfig.suggestionCount > 0) {
        requests.push(trendingRequest);
      }

      const responses = yield effects.all(requests);
      const navigationLabels = ConfigAdapter.extractAutocompleteNavigationLabels(config);
      const autocompleteSuggestions = Adapter.extractSuggestions(responses[0], query, field, navigationLabels, config);
      const suggestions = recommendationsConfig.suggestionCount > 0 ?
        {
          ...autocompleteSuggestions,
          suggestions: Adapter.mergeSuggestions(autocompleteSuggestions.suggestions, yield responses[1].json())
        } : autocompleteSuggestions;

      yield effects.put(flux.actions.receiveAutocompleteSuggestions(suggestions));
    } catch (e) {
      yield effects.put(flux.actions.receiveAutocompleteSuggestions(e));
    }
  }

  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, { payload: { query, refinements } }: Actions.FetchAutocompleteProducts) {
    try {
      const request = yield effects.select(RequestHelpers.autocompleteProducts);
      const overrideRefinements = request.refinements;
      const originalRefinements = refinements.map(({ field, ...rest }) =>
        ({ type: 'Value', navigationName: field, ...rest }));
      const mergedRefinements = [...originalRefinements, ...overrideRefinements];
      const req = {
        ...request,
        query,
        refinements: mergedRefinements,
      };
      const res = yield effects.call(Requests.search, flux, req);

      yield effects.put(<any>flux.actions.receiveAutocompleteProducts(res));
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveAutocompleteProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* autocompleteSaga() {
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux);
  yield effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux);
};
