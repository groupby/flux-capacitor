import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import PastPurchaseAdapter from './adapters/past-purchases';
import Personalization from './adapters/personalization';
import Recommendations from './adapters/recommendations';
import SearchAdapter, { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Selectors from './selectors';
import Store from './store';
import { normalizeToFunction } from './utils';

namespace RequestHelpers {
  export type RequestBody = Recommendations.RecommendationsBody
    | Recommendations.RecommendationsRequest
    | Recommendations.PastPurchaseRequest;

  export const buildPostBody = (body: RequestBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });

  export interface PastRequests {
    search: Request;
    autocompleteSuggestions: QueryTimeProductSearchConfig;
    autocompleteProducts: QueryTimeProductSearchConfig;
  }

  export const pastReqs: RequestHelpers.PastRequests = {
    search: <Request>{},
    autocompleteSuggestions: <QueryTimeProductSearchConfig>{},
    autocompleteProducts: <QueryTimeProductSearchConfig>{}
  };

  // tslint:disable-next-line max-line-length
  export const override = <T>(overrideConfig: (currReq: T, prevReq: T) => T, pastReq: keyof RequestHelpers.PastRequests): ((r: T) => T) =>
    (r: T) => overrideConfig(r, <T>pastReqs[pastReq]);

  export const setPastState = <T>(pastReq: keyof RequestHelpers.PastRequests): ((request: T) => T) =>
    (request) => pastReqs[pastReq] = request;

  export const search = (state: Store.State, addOverride: boolean = true): Request => {
    const config = Selectors.config(state);
    const sort = Selectors.sort(state);
    const pageSize = Selectors.pageSize(state);
    const skip = Selectors.skip(state, pageSize);
    const request: Partial<Request> = {
      pageSize: Math.min(pageSize, MAX_RECORDS - skip),
      area: Selectors.area(state),
      fields: Selectors.fields(state),
      query: Selectors.query(state),
      collection: Selectors.collection(state),
      refinements: Selectors.selectedRefinements(state),
      skip
    };

    const language = Configuration.extractLanguage(config);
    if (language) {
      request.language = language;
    }
    if (sort) {
      request.sort = <any>SearchAdapter.requestSort(sort);
    }
    if (Configuration.shouldAddPastPurchaseBias(config)) {
      request.biasing = PastPurchaseAdapter.pastPurchaseBiasing(state);
    }

    const requestTransformer = [Configuration.searchDefaults(config), normalizeToFunction(request)];

    if (addOverride) {
      requestTransformer.push(
        RequestHelpers.override(Configuration.searchOverrides(config), 'search'),
        RequestHelpers.setPastState('search')
      );
    }

    return <Request>RequestHelpers.chain(...requestTransformer);
  };

  // tslint:disable-next-line max-line-length
  export const pastPurchaseProducts = (state: Store.State, getNavigations: boolean = false, { pageSize, skip }: { pageSize?: number, skip?: number } = {}): Request => {
    pageSize = pageSize || Selectors.pastPurchasePageSize(state);
    skip = skip || Selectors.pastPurchasePageSize(state) * (Selectors.pastPurchasePage(state) - 1);

    const request: Partial<Request> = {
      ...search(state),
      pageSize,
      query: getNavigations ? '' : Selectors.pastPurchaseQuery(state),
      refinements: getNavigations ? [] : Selectors.pastPurchaseSelectedRefinements(state),
      skip,
      // no sort needed, saves backend from processing this
      sort: undefined,
    };

    return <Request>request;
  };

  export const autocompleteSuggestions = (config: AppConfig): QueryTimeAutocompleteConfig => {
    const normalizedRequest = normalizeToFunction({
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config)
    });

    return RequestHelpers.chain(
      Configuration.autocompleteSuggestionsDefaults(config),
      normalizedRequest,
      RequestHelpers.override(Configuration.autocompleteSuggestionsOverrides(config), 'autocompleteSuggestions'),
      RequestHelpers.setPastState('autocompleteSuggestions')
    );
  };

  export const autocompleteProducts = (state: Store.State): Request => {
    const config = Selectors.config(state);

    let request: Request = {
      ...RequestHelpers.search(state, false),
      refinements: [],
      skip: 0,
      sort: undefined,
      language: Autocomplete.extractProductLanguage(config),
      area: Autocomplete.extractProductArea(config),
      pageSize: Configuration.extractAutocompleteProductCount(config)
    };

    if (config.personalization.realTimeBiasing.autocomplete) {
      request = RequestHelpers.realTimeBiasing(state, request);
    }

    return RequestHelpers.chain(
      Configuration.autocompleteProductsDefaults(config),
      normalizeToFunction(request),
      RequestHelpers.override(Configuration.autocompleteProductsOverrides(config), 'autocompleteProducts'),
      RequestHelpers.setPastState('autocompleteProducts')
    );
  };

  // tslint:disable-next-line max-line-length
  export const realTimeBiasing = (state: Store.State, request: Request): Request => {
    const addedBiases = Personalization.convertBiasToSearch(state, request.refinements);

    return {
      ...request,
      biasing: {
        ...request.biasing,
        biases: ((request.biasing ? request.biasing.biases : []) || []).concat(addedBiases),
      }
    };
  };

  export const chain = <T>(...fns: Array<(...obj: any[]) => T>): T =>
    fns.reduce((final, fn) => fn(final) || final, <T>{});

  export const composeRequest = (defaultFn, req, overrideFn, pastStateKey) =>
    RequestHelpers.chain(
      defaultFn,
      normalizeToFunction(req),
      RequestHelpers.override(overrideFn, pastStateKey),
      RequestHelpers.setPastState(pastStateKey)
    );
}

export default RequestHelpers;
