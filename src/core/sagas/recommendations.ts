import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import { fetch } from '../utils';

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      const state = yield effects.select();
      const config = yield effects.select(Selectors.config);
      const { idField, productSuggestions: productConfig } = config.recommendations;
      const productCount = productConfig.productCount;
      if (productCount > 0) {
        // fall back to default mode "popular" if not provided
        // "popular" default will likely provide the most consistently strong data
        const mode = Configuration.RECOMMENDATION_MODES[productConfig.mode || 'popular'];
        const recommendationsUrl = Adapter.buildUrl(config.customerId, 'products', mode);
        const recommendationsRequestBody = {
          size: productConfig.productCount,
          type: 'viewProduct',
          target: idField
        };

        const recommendationsResponse = yield effects.call(fetch, recommendationsUrl, {
          method: 'POST',
          body: JSON.stringify(Adapter.addLocationToRequest(recommendationsRequestBody, state))
        });
        const recommendations = yield recommendationsResponse.json();
        const refinements = recommendations.result
          .filter(({ productId }) => productId)
          .map(({ productId }) => ({ navigationName: idField, type: 'Value', value: productId }));
        const results = yield effects.call(
          [flux.clients.bridge, flux.clients.bridge.search],
          {
            ...Requests.search(state),
            pageSize: productConfig.productCount,
            includedNavigations: [],
            skip: 0,
            refinements
          }
        );

        yield effects.put(flux.actions.receiveRecommendationsProducts(SearchAdapter.augmentProducts(results)));
      }
      return [];
    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }

  export function* fetchPastPurchases(flux: FluxCapacitor, { payload }: Actions.FetchPastPurchases) {
    try {
      const config = yield effects.select(Selectors.config);
      const productCount = config.recommendations.pastPurchases.productCount;
      if (productCount > 0) {
        const url = `http://${config.customerId}.groupbycloud.com/orders/public/skus/_search`;
        // TODO: change to be the real/right request
        const response = yield effects.call(fetch, url, Adapter.buildBody(<any>{
          // slide 9 of Past Purchase Epic?
          keyword: payload && undefined
        }));
        const result = yield response.json();
        // TODO: modify data so it's in the right form?
        yield effects.put(flux.actions.receivePastPurchases(result.result));
      }
      return [];
    } catch (e) {
      return effects.put(flux.actions.receivePastPurchases(e));
    }
  }

  export function* fetchOrderHistory(flux: FluxCapacitor, action: Actions.FetchOrderHistory) {
    try {
      const url = `http://${flux.config.customerId}.groupbycloud.com/orders/public/_search`;
      const response = yield effects.call(fetch, url, Adapter.buildBody(<any>{
        // slide 18 of Past Purchase Epic?
        cartType: 'online',
        // pagination stuff
        skip: 0,
        pageSize: 100,
      }));
      const result = yield response.json();
      // TODO: modify data so it's in the right form?
      yield effects.put(flux.actions.receiveOrderHistory(result.result[0].items));

      return [];
    } catch (e) {
      return effects.put(flux.actions.receiveOrderHistory(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux);
  // yield effects.takeLatest(Actions.FETCH_PAST_PURCHASES, Tasks.fetchPastPurchases, flux);
  // yield effects.takeLatest(Actions.FETCH_ORDER_HISTORY, Tasks.fetchOrderHistory, flux);
};
