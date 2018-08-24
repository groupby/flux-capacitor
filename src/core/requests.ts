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

  // export const autocompleteSuggestionsBuilder = {
  //   build: RequestHelpers.autocompleteSuggestions,
  //   pastRequest: <QueryTimeProductSearchConfig>{},
  // };

  // export const requestBuilder = {
    // autocompleteProducts: {
    //   build: RequestHelpers.autocompleteProducts,
    //   pastRequest: <QueryTimeProductSearchConfig>{},
    // },
    // autocompleteSuggestions: {
    //   build: RequestHelpers.autocompleteSuggestions,
    //   pastRequest: <QueryTimeProductSearchConfig>{},
    // },
    // collection: {
    //   build: RequestHelpers.collection,
    //   pastRequest: <Request>{},
    // },
    // pastPurchaseSkus: {
    //   build: RequestHelpers.skus,
    //   pastRequest: {},
    // },
    // pastPurchaseProducts: {
    //   build: RequestHelpers.pastPurchaseProducts,
    //   pastRequest: <Request>{},
    // },
    // productDetails: {
    //   build: RequestHelpers.productDetails,
    //   pastRequest: <Request>{},
    // },
    // products: {
    //   build: RequestHelpers.products,
    //   pastRequest: <Request>{},
    // },
    // recommendationsNavigations: {
    //   build: RequestHelpers.recommendationsNavigations,
    //   pastRequest: {},
    // },
    // recommendationsProductIds: {
    //   build: RequestHelpers.recommendationsProductIds,
    //   pastRequest: {},
    // },
    // recommendationsProducts: {
    //   build: RequestHelpers.recommendationsProducts,
    //   pastRequest: <Request>{},
    // },
    // recommendationsSuggestions: {
    //   build: RequestHelpers.recommendationsSuggestions,
    //   pastRequest: {},
    // },
    // refinements: {
    //   build: RequestHelpers.refinements,
    //   pastRequest: {},
    // },
  // };

  // tslint:disable-next-line max-line-length
  export const override = <T>(overrideConfig: (currReq: T, prevReq: T) => T, requestSection): ((r: T) => T) =>
    (r: T) => overrideConfig(r, <T>requestSection.pastRequest);

  export const setPastState = <T>(requestSection): ((request: T) => T) =>
    (request) => requestSection.pastRequest = request;

  export const search = (state: Store.State): Request => {
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

    return <Request>request;

    // const requestTransformer = [normalizeToFunction(request)];
    //
    // // if (addOverride) {
    // //   requestTransformer.push(
    // //     RequestHelpers.override(Configuration.searchOverrides(config), 'search'),
    // //     RequestHelpers.setPastState('search')
    // //   );
    // // }
    // //
    // // return <Request>RequestHelpers.chain(...requestTransformer);
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

  // tslint:disable-next-line
  export const autocompleteSuggestions = (config: AppConfig): QueryTimeAutocompleteConfig => ({
    language: Autocomplete.extractLanguage(config),
    numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
    numNavigations: Configuration.extractAutocompleteNavigationCount(config),
    sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
    fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config)
  });

    // const normalizedRequest = normalizeToFunction({
    //   language: Autocomplete.extractLanguage(config),
    //   numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
    //   numNavigations: Configuration.extractAutocompleteNavigationCount(config),
    //   sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
    //   fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config)
    // });
    //
    // return RequestHelpers.chain(
    //   normalizedRequest,
    //   RequestHelpers.override(Configuration.autocompleteSuggestionsOverrides(config), 'autocompleteSuggestions'),
    //   RequestHelpers.setPastState('autocompleteSuggestions')
    // );

  export const autocompleteProducts = (state: Store.State): Request => {
    const config = Selectors.config(state);

    let request: Request = {
      ...RequestHelpers.search(state),
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

    return request;

    // return RequestHelpers.chain(
    //   normalizeToFunction(request),
    //   RequestHelpers.override(Configuration.autocompleteProductsOverrides(config), 'autocompleteProducts'),
    //   RequestHelpers.setPastState('autocompleteProducts')
    // );
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

  export const autocompleteSuggestionsBuilder = {
    build: RequestHelpers.autocompleteSuggestions,
    pastRequest: <QueryTimeProductSearchConfig>{},
  };

  export const composeRequest = (requestSection, overrideFn = () => ({})) => {
    return RequestHelpers.chain(
      normalizeToFunction(requestSection.build),
      RequestHelpers.override(overrideFn, requestSection),
      RequestHelpers.setPastState(requestSection)
    );
  };
}

export default RequestHelpers;
