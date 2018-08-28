import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Configuration from '../adapters/configuration';
import ConfigurationType from '../configuration';
import Selectors from '../selectors';
import { normalizeToFunction } from '../utils';
import RequestHelpers from './utils';

export type Override = (config: ConfigurationType) => <T>(...arg: T[]) => T;

export default class RequestBuilder<T = any> {
  pastRequest: T;
  _override: Override;

  constructor(
    private _build: (state: object, overrideState: object) => T,
    _override: Override = () => normalizeToFunction({})
  ) {
    this.pastRequest = {} as T;
    this._override = (state) => _override(Selectors.config(state));
  }

  build(state: object, overrideState: object = {}) {
    return this._build(state, overrideState);
  }

  override<S>(overrideConfig: (currReq: S, prevReq: S) => S, reference: RequestBuilder): ((r: S) => S) {
    return (r: S) => overrideConfig(r, <S>reference.pastRequest);
  }

  setPastState<S>(reference: RequestBuilder): ((request: S) => S) {
    return (request) => reference.pastRequest = request;
  }

  composeRequest(state: any, overrideState?: any) {
    return RequestHelpers.chain(
      normalizeToFunction(this.build(state, overrideState)),
      this.override(this._override(state), this),
      this.setPastState(this)
    );
  }
}

/* tslint:disable max-line-length */
export const autocompleteProductsRequest = new RequestBuilder<QueryTimeProductSearchConfig>(RequestHelpers.autocompleteProducts, Configuration.autocompleteProductsOverrides);
export const autocompleteSuggestionsRequest = new RequestBuilder<QueryTimeAutocompleteConfig>(RequestHelpers.autocompleteSuggestions, Configuration.autocompleteSuggestionsOverrides);
export const collectionRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.collectionOverrides);
export const pastPurchaseProductsRequest = new RequestBuilder<Request>(RequestHelpers.pastPurchaseProducts);
export const productDetailsRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.detailsOverrides);
export const productsRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.searchOverrides);
export const recommendationsNavigationsRequest = new RequestBuilder(RequestHelpers.recommendationsNavigations);
export const recommendationsProductIDsRequest = new RequestBuilder<Request>(RequestHelpers.recommendationsProductIDs);
export const recommendationsProductsRequest = new RequestBuilder<Request>(RequestHelpers.search);
export const recommendationsSuggestionsRequest = new RequestBuilder(RequestHelpers.recommendationsSuggestions);
export const refinementsRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.refinementsOverrides);
/* tslint:enable */

export const requestBuilder: Record<RequestType, any> = {
  // pastPurchaseSkus: {
  //   build: RequestHelpers.skus,
  //   pastRequest: {},
  //   override: (state) => normalizeToFunction({}),
  // },
};
