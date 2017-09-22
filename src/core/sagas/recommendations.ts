import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import Requests from '../requests';
import Store from '../store';
import { fetch } from '../utils';

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      const state = yield effects.select();
      const config = flux.config.recommendations.productSuggestions;
      // fall back to default mode "popular" if not provided
      // "popular" default will likely provide the most consistently strong data
      const mode = Configuration.RECOMMENDATION_MODES[config.mode || 'popular'];
      // tslint:disable-next-line max-line-length
      const recommendationsUrl = Adapter.buildUrl(flux.config.customerId, 'products', mode);
      const recommendationsResponse = yield effects.call(fetch, recommendationsUrl, Adapter.buildBody({
        size: config.productCount,
        type: 'viewProduct',
        target: config.idField
      }));
      const recommendations = yield recommendationsResponse.json();
      // tslint:disable-next-line max-line-length
      const refinements = recommendations.result
        .filter(({ productId }) => productId)
        .map(({ productId }) => ({ navigationName: config.idField, type: 'Value', value: productId }));
      const { records } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...Requests.search(state, flux.config),
          pageSize: config.productCount,
          includedNavigations: [],
          skip: 0,
          refinements
        }
      );

      yield effects.put(flux.actions.receiveRecommendationsProducts(records.map(SearchAdapter.extractProduct)));
    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }

  export function* fetchNavigations(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      // const config = flux.config.recommendations;
      // const recommendationsUrl = `${Adapter.buildUrl(flux.config.customerId)}/refinements/_getPopular`;
      const recommendationsUrl = Adapter.buildUrl('zorotools', 'refinements', 'Popular');
      const recommendationsResponse = yield effects.call(fetch, recommendationsUrl, Adapter.buildBody({
        size: 10,
        window: 'day',
      }));
      console.log(recommendationsResponse);
      const recommendations = yield recommendationsResponse.json();
      const refinements = recommendations.result
        .filter(({ values }) => values); // assumes no values key will be empty
      console.log('put');
      yield effects.put(flux.actions.receiveRecommendationsNavigations(refinements));
      yield effects.put(flux.actions.receiveRecommendationsRefinements(refinements));
    } catch (e) {
      console.log(e);
      yield effects.put(flux.actions.receiveRecommendationsRefinements(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux);
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_REFINEMENTS, Tasks.fetchNavigations, flux);
};
