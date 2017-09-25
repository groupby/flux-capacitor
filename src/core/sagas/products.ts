import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import RecommendationsAdapter from '../adapters/recommendations';
import * as Events from '../events';
import Requests from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';
import { Tasks as productDetailsTasks } from './product-details';

export namespace Tasks {
  export function* fetchProductsAndNavigations (flux: FluxCapacitor, action: Actions.FetchProducts) {
    const [products, navigations] = yield effects.all([
      effects.call(fetchProducts, flux, action),
      effects.call(fetchNavigations, flux, action)
    ]);
    if (products.redirect) {
      yield effects.put(flux.actions.receiveRedirect(products.redirect));
    }

    if (flux.config.search.redirectSingleResult && products.totalRecordCount === 1) {
      yield effects.call(productDetailsTasks.receiveDetailsProduct, flux, products.records[0]);
    } else {
      flux.emit(Events.BEACON_SEARCH, products.id);
      yield effects.put(<any>flux.actions.receiveProductsAndNavigations(products, navigations));
      // yield effects.put(<any>flux.actions.receiveProducts(products));

      yield flux.config.recommendations.iNav.navigations.sort &&
        effects.put(flux.actions.receiveRecommendationsNavigations(refinements));
      yield flux.config.recommendations.iNav.refinements.sort &&
        effects.put(flux.actions.receiveRecommendationsRefinements(refinements));
      flux.saveState(utils.Routes.SEARCH);
    }
  }
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      const navigationsTask = yield effects.fork(fetchNavigations, flux, action);
      const request = yield effects.select(Requests.search, flux.config);
      const res = yield effects.call([flux.clients.bridge, flux.clients.bridge.search], request);
      return res;
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveProducts(e));
    }
  }

  export function* fetchNavigations(flux: FluxCapacitor, action: Actions.FetchProducts) {
    if (flux.config.recommendations.iNav.navigations.sort ||
      flux.config.recommendations.iNav.refinements.sort) {
      const recommendationsUrl = RecommendationsAdapter.buildUrl(flux.config.customerId, 'refinements', 'Popular');
      // tslint:disable-next-line max-line-length
      const recommendationsResponse = yield effects.call(utils.fetch, recommendationsUrl, RecommendationsAdapter.buildBody({
        size: 10,
        window: 'day',
      }));
      const recommendations = yield recommendationsResponse.json();
      const refinements = recommendations.result
        .filter(({ values }) => values); // assumes no values key will be empty
    }
  }

  export function* fetchMoreProducts(flux: FluxCapacitor, action: Actions.FetchMoreProducts) {
    try {
      const state: Store.State = yield effects.select();
      const { records: products, id } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...Requests.search(state, flux.config),
          pageSize: action.payload,
          skip: Selectors.products(state).length
        }
      );

      flux.emit(Events.BEACON_SEARCH, id);
      yield effects.put(flux.actions.receiveMoreProducts(products));
    } catch (e) {
      yield effects.put(flux.actions.receiveMoreProducts(e));
    }
  }
}

export default (flux: FluxCapacitor) => {
  return function* saga() {
    yield effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProducts, flux);
    yield effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux);
  };
};
