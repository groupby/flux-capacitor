import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Payload from '../actions/payloads';
import Configuration from '../adapters/configuration';
import Recommendations from '../adapters/recommendations';
import ConfigurationType from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import { normalizeToFunction, GenericTransformer } from '../utils';
import RequestHelpers from './utils';

export default class RequestBuilder<T = any, U = T> {
  pastRequest: T;
  _override: (state: Store.State) => GenericTransformer<T>;

  constructor(
    public build: RequestHelpers.BuildFunction<Partial<T>, U>,
    _override: Configuration.Override<T> = () => normalizeToFunction({})
  ) {
    this.pastRequest = {} as T;
    this._override = (state) => _override(Selectors.config(state));
  }

  override<S>(overrideConfig: (currReq: S, prevReq: S) => S, reference: RequestBuilder): ((r: S) => S) {
    return (r) => overrideConfig(r, reference.pastRequest);
  }

  setPastState<S>(reference: RequestBuilder): ((request: S) => S) {
    return (request) => reference.pastRequest = request;
  }

  composeRequest(state: Store.State, overrideRequest?: Partial<T>) {
    return RequestHelpers.chain(
      normalizeToFunction(this.build(state, overrideRequest)),
      this.override(this._override(state), this),
      this.setPastState(this)
    );
  }
}

/* tslint:disable max-line-length */
export const autocompleteProductsRequest = new RequestBuilder<Request>(RequestHelpers.autocompleteProducts, Configuration.autocompleteProductsOverrides);
export const autocompleteSuggestionsRequest = new RequestBuilder<QueryTimeAutocompleteConfig>(RequestHelpers.autocompleteSuggestions, Configuration.autocompleteSuggestionsOverrides);
export const autocompletePastPurchaseRequest = new RequestBuilder<Request>(RequestHelpers.autocompleteProducts);
export const collectionRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.collectionOverrides);
export const pastPurchaseProductsRequest = new RequestBuilder<Request>(RequestHelpers.pastPurchaseProducts);
export const productDetailsRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.detailsOverrides);
export const productsRequest = new RequestBuilder<Request>(RequestHelpers.products, Configuration.searchOverrides);
export const recommendationsNavigationsRequest = new RequestBuilder<Recommendations.RecommendationsBody>(RequestHelpers.recommendationsNavigations);
export const recommendationsProductIdsRequest = new RequestBuilder<Recommendations.RecommendationsRequest>(RequestHelpers.recommendationsProductIDs);
export const recommendationsProductsRequest = new RequestBuilder<Request>(RequestHelpers.search);
export const recommendationsSuggestionsRequest = new RequestBuilder<Recommendations.Request & { query: string }, Recommendations.Request>(RequestHelpers.recommendationsSuggestions);
export const refinementsRequest = new RequestBuilder<Request>(RequestHelpers.search, Configuration.refinementsOverrides);
/* tslint:enable */
