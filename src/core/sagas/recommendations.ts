import { Biasing, Request, Sort } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import ConfigAdapter from '../adapters/configuration';
import PageAdapter from '../adapters/page';
import PastPurchaseAdapter from '../adapters/past-purchases';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import {
  autocompletePastPurchaseRequest,
  pastPurchaseProductsRequest,
  recommendationsProductsRequest,
  recommendationsProductIdsRequest
} from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';
import Requests from './requests';

export class MissingPayloadError extends Error {
  /* istanbul ignore next */
  constructor(err: string = 'No Secured Payload') {
    super(err);
    Object.setPrototypeOf(this, MissingPayloadError.prototype);
  }
}

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchRecommendationsProducts(flux: FluxCapacitor, action: Actions.FetchRecommendationsProducts) {
    try {
      const state = yield effects.select();
      const config = yield effects.select(Selectors.config);
      const { idField, productSuggestions: productConfig } = config.recommendations;
      const productCount = productConfig.productCount;
      if (productCount > 0) {
        const body = recommendationsProductIdsRequest.composeRequest(state, action.payload.request);
        const recommendationsResponse = yield effects.call(
          Requests.recommendations,
          {
            customerId: config.customerId,
            endpoint: 'products',
            // fall back to default mode "popular" if not provided
            // "popular" default will likely provide the most consistently strong data
            mode: Configuration.RECOMMENDATION_MODES[productConfig.mode || 'popular'],
            body
          }
        );

        const recommendations = yield recommendationsResponse.json();
        const refinements = recommendations.result
          .filter(({ productId }) => productId)
          .map(({ productId }) => ({ navigationName: idField, type: 'Value', value: productId }));
        const requestBody = recommendationsProductsRequest.composeRequest(
          state,
          {
            pageSize: productConfig.productCount,
            includedNavigations: [],
            skip: 0,
            refinements
          }
        );
        const results = yield effects.call(Requests.search, flux, requestBody);

        yield effects.put(flux.actions.receiveRecommendationsProducts(SearchAdapter.augmentProducts(results)));
      }
    } catch (e) {
      yield effects.put(flux.actions.receiveRecommendationsProducts(e));
    }
  }

  export function* fetchPastPurchaseSkus(config: Configuration, endpoint: string, query?: string) {
    const securedPayload = ConfigAdapter.extractSecuredPayload(config);
    if (securedPayload) {
      const response = yield effects.call(
        Requests.pastPurchases,
        {
          customerId: config.customerId,
          endpoint,
          body: { securedPayload, query }
        }
      );

      const { result } = yield response.json();
      if (!result) {
        throw new MissingPayloadError();
      }
      return result;
    }
    throw new MissingPayloadError();
  }

  export function* fetchPastPurchases(flux: FluxCapacitor, action: Actions.FetchPastPurchases) {
    try {
      const config: Configuration = yield effects.select(Selectors.config);
      const productCount = ConfigAdapter.extractPastPurchaseProductCount(config);
      if (productCount > 0) {
        const result = yield effects.call(fetchPastPurchaseSkus, config, 'popular');
        yield effects.put(<any>[
          flux.actions.receivePastPurchaseAllRecordCount(result.length),
          flux.actions.receivePastPurchaseSkus(result)
        ]);
      } else {
        yield effects.put(flux.actions.receivePastPurchaseSkus([]));
      }
    } catch (e) {
      if (!(e instanceof MissingPayloadError)) { // pass through misisng payloads
        return effects.put(flux.actions.receivePastPurchaseSkus(e));
      }
    }
  }

  export function* fetchPastPurchaseProducts(flux: FluxCapacitor, action: Actions.FetchPastPurchaseProducts) {
    try {
      const pastPurchaseSkus: Store.PastPurchases.PastPurchaseProduct[] = yield effects.select(Selectors.pastPurchases);
      if (pastPurchaseSkus.length > 0) {
        const state = yield effects.select();
        const pastPurchasesFromSkus = Tasks.buildRequestFromSkus(flux, pastPurchaseSkus);
        const request = pastPurchaseProductsRequest.composeRequest(state, {
          ...pastPurchasesFromSkus,
          ...action.payload.request
        });
        const results = yield effects.call(Requests.search, flux, request);
        const pageSize = request.pageSize;
        yield effects.put(<any>[
          flux.actions.updatePastPurchasePageSize(pageSize),
          flux.actions.receivePastPurchasePage(
            SearchAdapter.extractRecordCount(results.totalRecordCount),
            PageAdapter.currentPage(request.skip, pageSize),
            pageSize
          ),
          flux.actions.receivePastPurchaseCurrentRecordCount(results.totalRecordCount),
          flux.actions.receivePastPurchaseProducts(SearchAdapter.augmentProducts(results)),
          flux.actions.receivePastPurchaseTemplate(SearchAdapter.extractTemplate(results.template)),
          flux.actions.receivePastPurchaseRefinements(SearchAdapter.combineNavigations(results)),
        ]);
        flux.replaceState(utils.Routes.PAST_PURCHASE);
      }
    } catch (e) {
      return effects.put(flux.actions.receivePastPurchaseProducts(e));
    }
  }

  export function* fetchMorePastPurchaseProducts(flux: FluxCapacitor, action: Actions.FetchMorePastPurchaseProducts) {
    try {
      const state: Store.State = yield effects.select();
      const products = Selectors.pastPurchaseProductsWithMetadata(state);
      const pastPurchaseSkus: Store.PastPurchases.PastPurchaseProduct[] = yield effects.select(Selectors.pastPurchases);
      const pageSize = action.payload.amount;

      let skip;
      if (action.payload.forward) {
        skip = products[products.length - 1].index;
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingForward: true }));
      } else {
        skip = products[0].index - Selectors.pastPurchasePageSize(state) - 1;
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingBackward: true }));
      }

      const pastPurchasesFromSkus = Tasks.buildRequestFromSkus(flux, pastPurchaseSkus);
      const request = pastPurchaseProductsRequest.composeRequest(state, {
        pageSize,
        skip,
        ...pastPurchasesFromSkus,
        ...action.payload.request
      });
      const result = yield effects.call(Requests.search, flux, request);

      yield effects.put(<any>[
        flux.actions.receivePastPurchaseCurrentRecordCount(result.totalRecordCount),
        flux.actions.receiveMorePastPurchaseProducts(result),
      ]);
      if (action.payload.forward) {
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingForward: false }));
      } else {
        yield effects.put(<any>flux.actions.infiniteScrollRequestState({ isFetchingBackward: false }));
      }
    } catch (e) {
      return effects.put(<any>flux.actions.receiveMorePastPurchaseProducts(e));
    }
  }

  // tslint:disable-next-line max-line-length
  export function* fetchSaytPastPurchases(flux: FluxCapacitor, { payload: { query, request } }: Actions.FetchSaytPastPurchases) {
    try {
      const state = yield effects.select();
      const pastPurchaseSkus = yield effects.select(Selectors.pastPurchases);
      if (pastPurchaseSkus.length > 0) {
        const req = autocompletePastPurchaseRequest.composeRequest(state, { query, ...request });
        const results = yield effects.call(Requests.search, flux, req);
        yield effects.put(flux.actions.receiveSaytPastPurchases(SearchAdapter.augmentProducts(results)));
      } else {
        yield effects.put(flux.actions.receiveSaytPastPurchases([]));
      }
    } catch (e) {
      return effects.put(flux.actions.receiveSaytPastPurchases(e));
    }
  }

  // tslint:disable-next-line max-line-length
  export function buildRequestFromSkus(flux: FluxCapacitor, skus: Store.PastPurchases.PastPurchaseProduct[]): Partial<Request> {
    const ids: string[] = skus.map(({ sku }) => sku);

    return {
      biasing: <Biasing>{
        restrictToIds: ids,
      },
      sort: <Sort[]>[{ type: 'ByIds', ids }],
    };
  }
}

export default (flux: FluxCapacitor) => function* recommendationsSaga() {
  yield effects.takeLatest(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, Tasks.fetchRecommendationsProducts, flux);
  yield effects.takeLatest(Actions.FETCH_PAST_PURCHASES, Tasks.fetchPastPurchases, flux);
  yield effects.takeLatest(Actions.FETCH_PAST_PURCHASE_PRODUCTS, Tasks.fetchPastPurchaseProducts, flux);
  yield effects.takeLatest(Actions.FETCH_SAYT_PAST_PURCHASES, Tasks.fetchSaytPastPurchases, flux);
  yield effects.takeEvery(Actions.FETCH_MORE_PAST_PURCHASE_PRODUCTS, Tasks.fetchMorePastPurchaseProducts, flux);
};
