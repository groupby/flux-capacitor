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
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchRecommendations) {
    try {
      const recommendations = flux.config.autocomplete.recommendations;
      const suggestionMode = Configuration.RECOMMENDATION_MODES[recommendations.suggestionMode || 'popular'];
      // tslint:disable-next-line max-line-length
      const trendingUrl = `https://${flux.config.customerId}.groupbycloud.com/wisdom/v2/public/recommendations/products/_get${suggestionMode}`;
      const requestTrending = effects.call(fetch, trendingUrl, {
        method: 'POST',
        body: JSON.stringify({
          size: recommendations.suggestionCount,
          type: 'viewProduct',
          target: 'productId'
        })
      });

    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchProducts, flux);
};
