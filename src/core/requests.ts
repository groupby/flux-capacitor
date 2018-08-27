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

  // tslint:disable-next-line max-line-length
  export const override = <T>(overrideConfig: (currReq: T, prevReq: T) => T, requestSection): ((r: T) => T) =>
    (r: T) => overrideConfig(r, <T>requestSection.pastRequest);

  export const setPastState = <T>(requestSection): ((request: T) => T) =>
    (request) => requestSection.pastRequest = request;

  export const search = (state: Store.State, overrideState: any = {}): Request => {
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

    return <Request>{ ...request, ...overrideState };
  };

  // tslint:disable-next-line max-line-length
  export const pastPurchaseProducts = (state: Store.State, overrideState: any = {}): Request => {
    const request: Partial<Request> = {
      ...RequestHelpers.search(state),
      pageSize: Selectors.pastPurchasePageSize(state),
      query: Selectors.pastPurchaseQuery(state),
      refinements: Selectors.pastPurchaseSelectedRefinements(state),
      skip: Selectors.pastPurchasePageSize(state) * (Selectors.pastPurchasePage(state) - 1),
      // no sort needed, saves backend from processing this
      sort: undefined,
    };

    return <Request>{ ...request, ...overrideState };
  };

  // tslint:disable-next-line
  export const autocompleteSuggestions = (state: Store.State, overrideState: any = {}): QueryTimeAutocompleteConfig => {
    const config = Selectors.config(state);

    return {
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config),
      ...overrideState
    };
  };

  export const autocompleteProducts = (state: Store.State, overrideState: any = {}): Request => {
    const config = Selectors.config(state);

    let request: Request = RequestHelpers.search(state, {
      refinements: [],
      skip: 0,
      sort: undefined,
      language: Autocomplete.extractProductLanguage(config),
      area: Autocomplete.extractProductArea(config),
      pageSize: Configuration.extractAutocompleteProductCount(config)
    });

    if (config.personalization.realTimeBiasing.autocomplete) {
      request = RequestHelpers.realTimeBiasing(state, request);
    }

    if (overrideState.refinements) {
      const overrideRefinements = request.refinements;
      const originalRefinements = overrideState.refinements.map(({ field, ...rest }) =>
      ({ type: 'Value', navigationName: field, ...rest }));

      request.refinements = [...originalRefinements, ...overrideRefinements];
    }

    return { ...request, ...overrideState };
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

  export const requestBuilder = {
    autocompleteProducts: {
      build: RequestHelpers.autocompleteProducts,
      pastRequest: <QueryTimeProductSearchConfig>{},
      override: (state) => Configuration.autocompleteProductsOverrides(Selectors.config(state)),
    },
    autocompleteSuggestions: {
      build: RequestHelpers.autocompleteSuggestions,
      pastRequest: <QueryTimeProductSearchConfig>{},
      override: (state) => Configuration.autocompleteSuggestionsOverrides(Selectors.config(state)),
    },
    collection: {
      build: RequestHelpers.search,
      pastRequest: <Request>{},
      override: (state) => Configuration.collectionOverrides(Selectors.config(state))
    },
    // pastPurchaseSkus: {
    //   build: RequestHelpers.skus,
    //   pastRequest: {},
    //   override: (state) => normalizeToFunction({}),
    // },
    pastPurchaseProducts: {
      build: RequestHelpers.pastPurchaseProducts,
      pastRequest: <Request>{},
      override: (state) => normalizeToFunction({}),
    },
    productDetails: {
      build: RequestHelpers.search,
      pastRequest: <Request>{},
      override: (state) => Configuration.detailsOverrides(Selectors.config(state)),
    },
    products: {
      build: RequestHelpers.search,
      pastRequest: <Request>{},
      override: (state) => Configuration.searchOverrides(Selectors.config(state)),
    },
    // recommendationsNavigations: {
    //   build: RequestHelpers.recommendationsNavigations,
    //   pastRequest: {},
    //   override: (state) => normalizeToFunction({}),
    // },
    // recommendationsProductIds: {
    //   build: RequestHelpers.recommendationsProductIds,
    //   pastRequest: {},
    //   override: (state) => normalizeToFunction({}),
    // },
    // recommendationsProducts: {
    //   build: RequestHelpers.recommendationsProducts,
    //   pastRequest: <Request>{},
    //   override: (state) => normalizeToFunction({}),
    // },
    // recommendationsSuggestions: {
    //   build: RequestHelpers.recommendationsSuggestions,
    //   pastRequest: {},
    //   override: (state) => normalizeToFunction({}),
    // },
    refinements: {
      build: RequestHelpers.search,
      pastRequest: {},
      override: (state) => Configuration.refinementsOverrides(Selectors.config(state)),
    },
  };

  export const composeRequest = (requestSection, state: any, overrideState?: any) => {
    return RequestHelpers.chain(
      normalizeToFunction(requestSection.build(state, overrideState)),
      RequestHelpers.override(requestSection.override(state), requestSection),
      RequestHelpers.setPastState(requestSection)
    );
  };
}

export default RequestHelpers;
