import 'isomorphic-fetch';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/search';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';

declare function fetch();

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      const state = yield effects.select();
      const config = flux.config.recommendations;
      const mode = Configuration.RECOMMENDATION_MODES[config.mode || 'popular'];
      // tslint:disable-next-line max-line-length
      const recommendationsUrl = `https://${flux.config.customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_get${mode}`;
      const recommendationsResponse = yield effects.call(fetch, recommendationsUrl, {
        method: 'POST',
        body: JSON.stringify({
          size: config.productCount,
          type: 'viewProduct',
          target: config.idField
        })
      });
      const recommendations = yield recommendationsResponse.json();
      // tslint:disable-next-line max-line-length
      const refinements = recommendations.result
        .filter(({ productId }) => productId)
        .map(({ productId }) => ({ navigationName: config.idField, type: 'Value', value: productId }));
      const { records } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...Selectors.searchRequest(state, flux.config),
          pageSize: config.productCount,
          includedNavigations: [],
          skip: 0,
          refinements
        }
      );

      yield effects.put(flux.actions.receiveRecommendationsProducts(records.map(Adapter.extractProduct)));
    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux);
};
