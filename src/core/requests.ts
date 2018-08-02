import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import PastPurchaseAdapter from './adapters/pastPurchases';
import Personalization from './adapters/personalization';
import SearchAdapter, { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Selectors from './selectors';
import Store from './store';
import { normalizeToFunction } from './utils';

namespace Requests {
  export interface PastRequests {
    search: Partial<Request>;
    autocompleteProducts: Partial<QueryTimeProductSearchConfig>;
  }

  export const pastReqs: Requests.PastRequests = {
    search: {},
    autocompleteProducts: {}
  };

  // tslint:disable-next-line max-line-length
  export const override = <T>(overrideConfig: T | ((currReq: T, prevReq: T) => T), req: T, pastReq: keyof Requests.PastRequests): T => {
    const finalReq = Requests.chain(req, overrideConfig);
    pastReqs[pastReq] = finalReq;
    return finalReq;
  };

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

    const finalReq = Requests.chain(Configuration.searchDefaults(config), request);

    // tslint:disable-next-line max-line-length
    return addOverride ? <Request>Requests.override(Configuration.searchOverrides(config), finalReq, 'search') : <Request>finalReq;
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

  export const autocompleteSuggestions = (config: AppConfig): QueryTimeAutocompleteConfig =>
    Requests.chain(Configuration.autocompleteSuggestionsDefaults(config), {
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config)
    }, Configuration.autocompleteSuggestionsOverrides(config));

  export const autocompleteProducts = (state: Store.State): Request => {
    const config = Selectors.config(state);

    let request: Request = {
      ...Requests.search(state, false),
      refinements: [],
      skip: 0,
      sort: undefined,
      language: Autocomplete.extractProductLanguage(config),
      area: Autocomplete.extractProductArea(config),
      pageSize: Configuration.extractAutocompleteProductCount(config)
    };

    if (config.personalization.realTimeBiasing.autocomplete) {
      request = Requests.realTimeBiasing(state, request);
    }

    const finalReq = Requests.chain(Configuration.autocompleteProductsDefaults(config), request);

    // tslint:disable-next-line max-line-length
    return <Request>Requests.override(Configuration.autocompleteProductsOverrides(config), finalReq, 'autocompleteProducts');
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

  export const chain = <T>(...objs: Array<T | ((...obj: T[]) => T)>): T =>
    <T>objs.reduce((final, obj) => normalizeToFunction(obj)(final) || final, {});
}

export default Requests;
