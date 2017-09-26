import { Results, ValueRefinement } from 'groupby-api';
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
  export function* fetchProductsAndNavigations(flux: FluxCapacitor, action: Actions.FetchProducts) {
    // RecommendationsAdapter.pinNavigations(<any>{}, flux.config);
    try {
      const [products, navigations]: [Results, Store.Recommendations.Navigation[]] = yield effects.all([
        effects.call(fetchProducts, flux, action),
        effects.call(fetchNavigations, flux, action)
      ]);
      if (products.redirect) {
        yield effects.put(flux.actions.receiveRedirect(products.redirect));
      }
      if (flux.config.search.redirectSingleResult && products.totalRecordCount === 1) {
        yield effects.call(productDetailsTasks.receiveDetailsProduct, flux, products.records[0]);
      } else {
        flux.emit(Events.BEACON_SEARCH, (<any>products).id);
        if (navigations && !(navigations instanceof Error)) {
          const iNav = flux.config.recommendations.iNav;
          if (iNav.navigations.sort) {
            products.availableNavigation =
              RecommendationsAdapter.sortNavigations(products.availableNavigation, navigations);
          }
          if (Array.isArray(iNav.navigations.pinned)) {
            // tslint:disable-next-line max-line-length
            products.availableNavigation = RecommendationsAdapter.pinNavigations(products.availableNavigation, flux.config);
          }
          if (iNav.refinements.sort) {
            products.availableNavigation =
              RecommendationsAdapter.sortRefinements(products.availableNavigation, navigations);
          }
          if (iNav.refinements.pinned) {
            // tslint:disable-next-line max-line-length
            products.availableNavigation = RecommendationsAdapter.pinRefinements(products.availableNavigation, flux.config);
          }
          yield effects.put(<any>flux.actions.receiveRecommendationsNavigations(navigations));
        }
        yield effects.put(<any>flux.actions.receiveProducts(products));
        flux.saveState(utils.Routes.SEARCH);
      }
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveProducts(e));
    }
  }
  export function* fetchProducts(flux: FluxCapacitor, action: Actions.FetchProducts) {
    const request = yield effects.select(Requests.search, flux.config);
    const res = yield effects.call([flux.clients.bridge, flux.clients.bridge.search], request);
    return res;
  }

  export function* fetchNavigations(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      if (flux.config.recommendations.iNav.navigations.sort ||
        flux.config.recommendations.iNav.refinements.sort) {
        const recommendationsUrl = RecommendationsAdapter.buildUrl(flux.config.customerId, 'refinements', 'Popular');
        // tslint:disable-next-line max-line-length
        const recommendationsResponse = yield effects.call(utils.fetch, recommendationsUrl, RecommendationsAdapter.buildBody({
          size: 10,
          window: 'day',
        }));
        const recommendations = yield recommendationsResponse.json();
        const refinements: Store.Navigation[] = recommendations.result
          .filter(({ values }) => values); // assumes no values key will be empty
        return refinements;
      }
    } catch (e) {
      return e;
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
    yield effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProductsAndNavigations, flux);
    yield effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux);
  };
};
