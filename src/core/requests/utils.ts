import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Payload from '../actions/payloads';
import Autocomplete from '../adapters/autocomplete';
import Configuration from '../adapters/configuration';
import PastPurchaseAdapter from '../adapters/past-purchases';
import Personalization from '../adapters/personalization';
import Recommendations from '../adapters/recommendations';
import SearchAdapter, { MAX_RECORDS } from '../adapters/search';
import AppConfig from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import { normalizeToFunction } from '../utils';

namespace RequestHelpers {
  export type RequestBody = Recommendations.RecommendationsBody
    | Recommendations.RecommendationsRequest
    | Recommendations.PastPurchaseRequest;

  export const buildPostBody = (body: RequestBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });

  // tslint:disable-next-line max-line-length
  // export const override = <T>(overrideConfig: (currReq: T, prevReq: T) => T, requestSection): ((r: T) => T) =>
  //   (r: T) => overrideConfig(r, <T>requestSection.pastRequest);
  //
  // export const setPastState = <T>(requestSection): ((request: T) => T) =>
  //   (request) => requestSection.pastRequest = request;

  export type BuildFunction<T, S> = (state: Store.State, overrideState?: T) => S;

  export const search: BuildFunction<Partial<Request>, Request> = (state, overrideState?) => {
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

  export const pastPurchaseProducts: BuildFunction<Partial<Request>, Request> = (state, overrideState?) => {
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

  export const recommendationsSuggestions: BuildFunction<
    Partial<Recommendations.Request & { query: string }>,
    Recommendations.Request
  > = (state, overrideState?) => {
    const config = Selectors.config(state);

    const request = Recommendations.addLocationToRequest({
      size: config.autocomplete.recommendations.suggestionCount,
      matchPartial: {
        and: [{
          search: {
            query: overrideState.query || Selectors.query(state),
          }
        }]
      }
    }, state);

    return { ...request, ...overrideState };
  };

  export const recommendationsNavigations: BuildFunction<
    Partial<Recommendations.RecommendationsBody>,
    Recommendations.RecommendationsBody
  > = (state, overrideState?) => {
    const query = Selectors.query(state);
    const iNav = Selectors.config(state).recommendations.iNav;
    const sizeAndWindow = { size: iNav.size, window: iNav.window };
    // tslint:disable-next-line max-line-length
    const request = {
      minSize: iNav.minSize || iNav.size,
      sequence: [
        { ...sizeAndWindow,
          matchPartial: {
            and: [{ search: { query } }]
          },
        },
        {
          ...sizeAndWindow,
        }
      ]
    };

    return { ...request, ...overrideState };
  };

  export const recommendationsProductIDs: BuildFunction<
    Partial<Recommendations.RecommendationsRequest>,
    Recommendations.RecommendationsRequest
  > = (state, overrideState?) => {
    const config = Selectors.config(state);

    const request = Recommendations.addLocationToRequest({
      size: config.recommendations.productSuggestions.productCount,
      type: 'viewProduct',
      target: config.recommendations.idField
    }, state);

    return { ...request, ...overrideState };
  };

  // tslint:disable-next-line
  export const autocompleteSuggestions: BuildFunction<
    Partial<QueryTimeAutocompleteConfig>,
    QueryTimeAutocompleteConfig
  > = (state, overrideState?) => {
    const config = Selectors.config(state);
    const request = {
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config),
    };

    return { ...request, ...overrideState };
  };

  export const autocompleteProducts: BuildFunction<
    Partial<Request>,
    Request
  > = (state, overrideState?) => {
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

    return <Request>{ ...request, ...overrideState };
  };

  export const products: BuildFunction<Partial<Request>, Request> = (state, overrideState?) =>
    ({ ...RequestHelpers.realTimeBiasing(state, RequestHelpers.search(state)), ...overrideState });

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

  // export enum RequestType {
  //   AUTOCOMPLETE_PRODUCTS = 'AUTOCOMPLETE_PRODUCTS'
  // }
  //
  // export class RequestBuilder<T = object> {
  //   pastRequest: T;
  //
  //   constructor(type: RequestType, private _build: any, override: any) {
  //     this.pastRequest = {} as T;
  //   }
  //   build(){
  //     return this._build();
  //   }
  //
  //   compose = (state, overrideState) => this.composeRequest();
  //
  //   composeRequest = (requestSection, state: any, overrideState?: any) => {
  //     return RequestHelpers.chain(
  //       normalizeToFunction(requestSection.build(state, overrideState)),
  //       RequestHelpers.override(requestSection.override(state), requestSection),
  //       RequestHelpers.setPastState(requestSection)
  //     );
  //   }
  // }
  //
  // export const autocompleteRequestBuilder = new RequestBuilder<QueryTimeProductSearchConfig>(RequestType.AUTOCOMPLETE_PRODUCTS, () => null, () => null);
  //
  // export const requestBuilder: Record<RequestType, any> = {
  //   autocompleteSuggestions: {
  //     build: RequestHelpers.autocompleteProducts,
  //     pastRequest: <QueryTimeProductSearchConfig>{},
  //     override: (state) => Configuration.autocompleteProductsOverrides(Selectors.config(state)),
  //   },
  //   autocompleteSuggestions: {
  //     build: RequestHelpers.autocompleteSuggestions,
  //     pastRequest: <QueryTimeProductSearchConfig>{},
  //     override: (state) => Configuration.autocompleteSuggestionsOverrides(Selectors.config(state)),
  //   },
  //   collection: {
  //     build: RequestHelpers.search,
  //     pastRequest: <Request>{},
  //     override: (state) => Configuration.collectionOverrides(Selectors.config(state))
  //   },
  //   // pastPurchaseSkus: {
  //   //   build: RequestHelpers.skus,
  //   //   pastRequest: {},
  //   //   override: (state) => normalizeToFunction({}),
  //   // },
  //   pastPurchaseProducts: {
  //     build: RequestHelpers.pastPurchaseProducts,
  //     pastRequest: <Request>{},
  //     override: (state) => normalizeToFunction({}),
  //   },
  //   productDetails: {
  //     build: RequestHelpers.search,
  //     pastRequest: <Request>{},
  //     override: (state) => Configuration.detailsOverrides(Selectors.config(state)),
  //   },
  //   products: {
  //     build: RequestHelpers.search,
  //     pastRequest: <Request>{},
  //     override: (state) => Configuration.searchOverrides(Selectors.config(state)),
  //   },
  //   recommendationsNavigations: {
  //     build: RequestHelpers.recommendationsNavigations,
  //     pastRequest: {},
  //     override: (state) => normalizeToFunction({}),
  //   },
  //   recommendationsProductIDs: {
  //     build: RequestHelpers.recommendationsProductIDs,
  //     pastRequest: <Request>{},
  //     override: (state) => normalizeToFunction({}),
  //   },
  //   recommendationsProducts: {
  //     build: RequestHelpers.search,
  //     pastRequest: <Request>{},
  //     override: (state) => normalizeToFunction({}),
  //   },
  //   recommendationsSuggestions: {
  //     build: RequestHelpers.recommendationsSuggestions,
  //     pastRequest: {},
  //     override: (state) => normalizeToFunction({}),
  //   },
  //   refinements: {
  //     build: RequestHelpers.search,
  //     pastRequest: {},
  //     override: (state) => Configuration.refinementsOverrides(Selectors.config(state)),
  //   },
  // };

  // export const composeRequest = (requestSection, state: any, overrideState?: any) => {
  //   return RequestHelpers.chain(
  //     normalizeToFunction(requestSection.build(state, overrideState)),
  //     RequestHelpers.override(requestSection.override(state), requestSection),
  //     RequestHelpers.setPastState(requestSection)
  //   );
  // };
}

export default RequestHelpers;
