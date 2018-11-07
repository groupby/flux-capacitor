import { Results } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import RecommendationsAdapter from '../adapters/recommendations';
import SearchAdapter from '../adapters/search';
import Events from '../events';
import { productsRequest, recommendationsNavigationsRequest } from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';
import Requests from './requests';

export namespace Tasks {
  export function* fetchProducts(flux: FluxCapacitor, ignoreHistory: boolean = false, action: Actions.FetchProducts) {
    try {
      let [result, navigations]: [Results, Store.Recommendations.Navigation[]] = yield effects.all([
        effects.call(fetchProductsRequest, flux, action),
        effects.call(fetchNavigations, flux, action)
      ]);
      const config = yield effects.select(Selectors.config);

      if (result.redirect) {
        return yield effects.put(flux.actions.receiveRedirect(result.redirect));
      }
      if (config.search.redirectSingleResult && result.totalRecordCount === 1) {
        yield effects.put(<any>flux.actions.fetchProductDetails(result.records[0].allMeta.id));
      } else {
        flux.emit(Events.BEACON_SEARCH, result.id);
        const actions: any = [];
        if (navigations && !(navigations instanceof Error)) {
          actions.push(flux.actions.receiveNavigationSort(navigations));
        } else {
          // if inav navigations is invalid then make it an empty array so it does not sort
          navigations = [];
        }
        const availableNavigation = RecommendationsAdapter.sortAndPinNavigations(
          result.availableNavigation,
          navigations,
          config
        );
        actions.push(flux.actions.receiveProducts({ ...result, availableNavigation }));

        yield effects.put(actions);

        if (!ignoreHistory) {
          flux.replaceState(utils.Routes.SEARCH);
        }
      }
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveProducts(e));
    }
  }

  export function* fetchProductsRequest(flux: FluxCapacitor, action: Actions.FetchProducts) {
    const state = yield effects.select();
    const request = productsRequest.composeRequest(state, action.payload.request);

    return yield effects.call(Requests.search, flux, request);
  }

  export function* fetchNavigations(flux: FluxCapacitor, action: Actions.FetchProducts) {
    try {
      const state = yield effects.select();
      const config = yield effects.select(Selectors.config);
      const iNav = config.recommendations.iNav;
      if (iNav.navigations.sort || iNav.refinements.sort) {
        const body = recommendationsNavigationsRequest.composeRequest(state);
        const recommendationsResponse = yield effects.call(
          Requests.recommendations,
          {
            customerId: config.customerId,
            endpoint: 'refinements',
            mode: 'Popular',
            body
          }
        );

        const recommendations = yield recommendationsResponse.json();
        return recommendations.result
          .filter(({ values }) => values); // assumes no values key will be empty
      }
      return [];
    } catch (e) {
      return e;
    }
  }

  export function* fetchMoreProducts(flux: FluxCapacitor, action: Actions.FetchMoreProducts) {
    try {
      const state: Store.State = yield effects.select();
      const products = Selectors.productsWithMetadata(state);
      const pageSize = action.payload.amount;
      const recordCount = SearchAdapter.extractRecordCount(Selectors.recordCount(state));

      let skip;
      if (action.payload.forward) {
        skip = products.length === 0 ? 0 : products[products.length - 1].index;
        if (skip >= recordCount) {
          throw new Error('cannot skip past the last record');
        }
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingForward: true }));
      } else {
        if (products.length === 0 || products[0].index <= 1) {
          throw new Error('cannot skip past the first record');
        }
        skip = products[0].index - pageSize - 1;
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingBackward: true }));
      }

      const requestBody = productsRequest.composeRequest(state, { pageSize, skip, ...action.payload.request });
      const result = yield effects.call(Requests.search, flux, requestBody);

      flux.emit(Events.BEACON_SEARCH, result.id);

      yield effects.put(<any>flux.actions.receiveMoreProducts(result));
      if (action.payload.forward) {
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingForward: false }));
      } else {
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingBackward: false }));
      }
    } catch (e) {
      yield effects.put(<any>flux.actions.receiveMoreProducts(e));
    }
  }

  export function* fetchProductsWhenHydrated(flux: FluxCapacitor, action: Actions.FetchProductsWhenHydrated) {
    if (Selectors.realTimeBiasesHydrated(flux.store.getState())) {
      yield effects.put(action.payload);
    } else {
      flux.once(Events.PERSONALIZATION_BIASING_REHYDRATED, () => flux.store.dispatch(action.payload));
    }
  }
}

export default (flux: FluxCapacitor) => {
  return function* saga() {
    yield effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProducts, flux, false);
    yield effects.takeLatest(Actions.FETCH_PRODUCTS_WITHOUT_HISTORY, Tasks.fetchProducts, flux, true);
    yield effects.takeLatest(Actions.FETCH_PRODUCTS_WHEN_HYDRATED, Tasks.fetchProductsWhenHydrated, flux);
    yield effects.takeEvery(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux);
  };
};
