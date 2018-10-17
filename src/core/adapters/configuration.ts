import { Request } from 'groupby-api';
import { AutocompleteConfig, ProductSearchConfig } from 'sayt';
import Configuration from '../configuration';
import * as AreaReducer from '../reducers/data/area';
import * as AutocompleteReducer from '../reducers/data/autocomplete';
import * as CollectionsReducer from '../reducers/data/collections';
import * as PageReducer from '../reducers/data/page';
import * as PastPurchaseReducer from '../reducers/data/past-purchases';
import * as PersonalizationAdapter from '../reducers/data/personalization';
import Store from '../store';
import { normalizeToFunction, GenericTransformer } from '../utils';

namespace Adapter {

  export const initialState = (config: Configuration): Partial<Store.State> =>
    ({
      data: <any>{
        present: {
          area: Adapter.extractArea(config, AreaReducer.DEFAULT_AREA),
          autocomplete: {
            ...AutocompleteReducer.DEFAULTS,
            category: {
              ...AutocompleteReducer.DEFAULTS.category,
              field: Adapter.extractSaytCategoryField(config),
            },
          },
          fields: Adapter.extractFields(config),
          collections: Adapter.extractCollections(config, CollectionsReducer.DEFAULT_COLLECTION),
          sorts: Adapter.extractSorts(config),
          page: {
            ...PageReducer.DEFAULTS,
            sizes: Adapter.extractPageSizes(config, PageReducer.DEFAULT_PAGE_SIZE)
          },
          pastPurchases: {
            ...PastPurchaseReducer.DEFAULTS,
            page: {
              ...PastPurchaseReducer.DEFAULTS.page,
              sizes: Adapter.extractPageSizes(config, PastPurchaseReducer.DEFAULT_PAGE_SIZE)
            }
          }
        }
      },
      session: { config }
    });

  export const extractArea = (config: Configuration, defaultValue?: string) =>
    config.area || defaultValue;

  export const extractAutocompleteArea = (config: Configuration) =>
    config.autocomplete.area;

  export const extractAutocompleteProductArea = (config: Configuration) =>
    config.autocomplete.products.area;

  export const extractFields = (config: Configuration) =>
    config.search.fields || [];

  export const extractLanguage = (config: Configuration) =>
    config.language;

  export const extractAutocompleteLanguage = (config: Configuration) =>
    config.autocomplete.language;

  export const extractAutocompleteProductLanguage = (config: Configuration) =>
    config.autocomplete.products.language;

  /**
   * extract current collection from config
   */
  export const extractCollection = (config: Configuration) =>
    typeof config.collection === 'object' ? config.collection.default : config.collection;

  export const extractAutocompleteCollection = (config: Configuration) =>
    config.autocomplete.collection;

  export const extractAutocompleteSuggestionCount = (config: Configuration) =>
    config.autocomplete.suggestionCount;

  export const extractAutocompleteProductCount = (config: Configuration) =>
    config.autocomplete.products.count;

  export const extractAutocompleteNavigationCount = (config: Configuration) =>
    config.autocomplete.navigationCount;

  export const extractAutocompleteHoverAutoFill = (config: Configuration) =>
    config.autocomplete.hoverAutoFill;

  export const isAutocompleteAlphabeticallySorted = (config: Configuration) =>
    config.autocomplete.alphabetical;

  export const isAutocompleteMatchingFuzzily = (config: Configuration) =>
    config.autocomplete.fuzzy;

  export const extractIndexedState = (state: string | { options: string[], default: string }) => {
    if (typeof state === 'object') {
      return { selected: state.default, allIds: state.options || [state.default] };
    } else {
      return { selected: state, allIds: [state] };
    }
  };

  // tslint:disable-next-line max-line-length
  export const extractCollections = (config: Configuration, defaultValue: string): Store.Indexed.Selectable<Store.Collection> => {
    const { selected, allIds } = Adapter.extractIndexedState(config.collection || defaultValue);

    return {
      selected,
      allIds,
      byId: allIds.reduce((map, name) => Object.assign(map, { [name]: { name } }), {})
    };
  };

  // tslint:disable-next-line max-line-length
  export const extractPageSizes = (config: Configuration, defaultValue: number): Store.SelectableList<number> => {
    const state = config.search.pageSize || defaultValue;
    if (typeof state === 'object') {
      const selected = state.default;
      const items = state.options || [defaultValue];
      const selectedIndex = items.findIndex((pageSize) => pageSize === selected);

      return { items, selected: (selectedIndex === -1 ? 0 : selectedIndex) };
    } else {
      return { selected: 0, items: [state] };
    }
  };

  export const extractSorts = (config: Configuration): Store.SelectableList<Store.Sort> => {
    const state = config.search.sort;
    if (typeof state === 'object' && ('options' in state || 'default' in state)) {
      const selected: Store.Sort = (<{ default: Store.Sort }>state).default || <any>{};
      const items = (<{ options: Store.Sort[] }>state).options || [];
      const selectedIndex = items
        .findIndex((sort) => sort.field === selected.field && !sort.descending === !selected.descending);

      return { items, selected: (selectedIndex === -1 ? 0 : selectedIndex) };
    } else {
      return { selected: 0, items: [<Store.Sort>state] };
    }
  };

  export const extractSaytCategoryField = (config: Configuration) =>
    config.autocomplete.category;

  export const extractSaytCategoriesForFirstMatch = (config: Configuration) =>
    config.autocomplete.showCategoryValuesForFirstMatch;

  export const extractAutocompleteNavigationLabels = (config: Configuration) => {
    return config.autocomplete.navigations;
  };

  export const extractMaxRefinements = (config: Configuration) =>
    config.search.maxRefinements;

  export const extractINav = (config: Configuration) =>
    config.recommendations.iNav;

  export const extractNavigationsPinned = (config: Configuration) =>
    extractINav(config).navigations.pinned;

  export const extractRefinementsPinned = (config: Configuration) =>
    extractINav(config).refinements.pinned;

  export const extractRefinementsSort = (config: Configuration) =>
    extractINav(config).refinements.sort;

  export const extractLocation = (config: Configuration) =>
    config.recommendations.location;

  export const extractSecuredPayload = (config: Configuration) => {
    const payload = config.recommendations.pastPurchases.securedPayload;
    return typeof payload === 'function' ? payload() : payload;
  };

  export const extractPastPurchaseProductCount = (config: Configuration) =>
    config.recommendations.pastPurchases.productCount;

  export const extractPastPurchaseNavigations = (config: Configuration) =>
    config.recommendations.pastPurchases.navigations;

  export const shouldAddPastPurchaseBias = (config: Configuration) =>
    config.recommendations.pastPurchases.biasCount > 0;

  export const isRealTimeBiasEnabled = (config: Configuration) =>
    !!config.personalization.realTimeBiasing.attributes;

  export const extractRealTimeBiasingExpiry = (config: Configuration) =>
    config.personalization.realTimeBiasing.expiry;

  export type Override<T = object> = (config: Configuration) => GenericTransformer<T>;

  export const searchOverrides: Override<Request> = (config) =>
    normalizeToFunction(config.search.overrides);

  export const autocompleteSuggestionsOverrides: Override<any> = (config) =>
    normalizeToFunction(config.autocomplete.overrides.suggestions);

  export const autocompleteProductsOverrides: Override<any> = (config) =>
    normalizeToFunction(config.autocomplete.overrides.products);

  export const collectionOverrides: Override<Request> = (config) =>
    normalizeToFunction(config.collections.overrides);

  export const detailsOverrides: Override<Request> = (config) =>
    normalizeToFunction(config.details.overrides);

  export const refinementsOverrides: Override<Request> = (config) =>
    normalizeToFunction(config.refinements.overrides);
}

export default Adapter;
