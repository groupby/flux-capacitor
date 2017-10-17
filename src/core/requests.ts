import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import RecommendationsAdapter from './adapters/recommendations';
import SearchAdapter, { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Selectors from './selectors';
import Store from './store';

namespace Requests {

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
      request.biasing = RecommendationsAdapter.pastPurchaseBiasing(state, config);
    }

    return <Request>Requests.chain(config.search.defaults, request, config.search.overrides);
  };

  export const autocompleteSuggestions = (config: AppConfig): QueryTimeAutocompleteConfig =>
    Requests.chain(config.autocomplete.defaults.suggestions, {
      language: Autocomplete.extractLanguage(config),
      numSearchTerms: Configuration.extractAutocompleteSuggestionCount(config),
      numNavigations: Configuration.extractAutocompleteNavigationCount(config),
      sortAlphabetically: Configuration.isAutocompleteAlphabeticallySorted(config),
      fuzzyMatch: Configuration.isAutocompleteMatchingFuzzily(config)
    }, config.autocomplete.overrides.suggestions);

  export const autocompleteProducts = (state: Store.State): QueryTimeProductSearchConfig => {
    const config = Selectors.config(state);
    return Requests.chain(config.autocomplete.defaults.products, {
      ...Requests.search(state),
      refinements: [],
      skip: 0,
      sort: undefined,
      language: Autocomplete.extractProductLanguage(config),
      area: Autocomplete.extractProductArea(config),
      pageSize: Configuration.extractAutocompleteProductCount(config)
    }, config.autocomplete.overrides.products);
  }

  export const chain = (...objs: Array<object | ((obj: object) => object)>) =>
    objs.reduce((final, obj) => {
      if (typeof obj === 'function') {
        return obj(final) || final;
      } else {
        return Object.assign(final, obj);
      }
    }, {});
}

export default Requests;
