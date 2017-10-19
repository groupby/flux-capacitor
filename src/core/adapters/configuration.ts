import Configuration from '../configuration';
import * as AreaReducer from '../reducers/data/area';
import * as CollectionsReducer from '../reducers/data/collections';
import * as PageReducer from '../reducers/data/page';
import Store from '../store';

namespace Adapter {

  export const initialState = (config: Configuration): Partial<Store.State> =>
    ({
      data: <any>{
        present: {
          area: Adapter.extractArea(config, AreaReducer.DEFAULT_AREA),
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: Adapter.extractSaytCategoryField(config),
              values: []
            },
          },
          recommendations: {
            suggested: { products: [] },
            pastPurchases: { products: [] },
            queryPastPurchases: [{"productThumbnail":{"longDescription":"This logo hat from Element is the top of the style food chain when it comes to your casual look. ","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Element Hat, Knutsen Hat"},"id":"943459","title":"Element Hat, Knutsen Hat","pdpData":{"onlineExclusive":"false","custRatings":"5.0","ratingPercent":"100","isChanel":"false","regularPrice":"22.0","title":"Element Hat, Knutsen Hat","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/1704852_fpx.tif","inStock":"true","id":"943459","showQuestionAnswers":"true","salePrice":"16.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"943459","giftCard":"false","name":"Element Hat, Knutsen Hat","showOffers":"true","coach":"false","categoryId":"47657"}},{"productThumbnail":{"longDescription":"For solid style, this flexfit hat by Hurley is top of the line and made out of 100% cotton offers comfort and breathability.","shortDescription":"Hurley Hat, One & Only Texture Flexfit Hat"},"id":"835915","title":"Hurley Hat, One & Only Texture Flexfit Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"30.0","title":"Hurley Hat, One & Only Texture Flexfit Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"835915","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/3/optimized/1565573_fpx.tif","giftCard":"false","name":"Hurley Hat, One &amp; Only Texture Flexfit Hat","inStock":"true","id":"835915","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"FlexFit comfort and understated style will quickly make this Hurley Bump hat your go-to.","shortDescription":"Hurley Bump 3.0 Hat"},"id":"1113948","title":"Hurley Bump 3.0 Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"29.5","title":"Hurley Bump 3.0 Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"1113948","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/8/optimized/3282368_fpx.tif","giftCard":"false","name":"Hurley Bump 3.0 Hat","inStock":"true","id":"1113948","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"Subtle, goes-with-anything style makes this Hurley Black Suits hat a must-have.","shortDescription":"Hurley Black Suits Hat"},"id":"1216772","title":"Hurley Black Suits Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"30.0","title":"Hurley Black Suits Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"1216772","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/3118482_fpx.tif","giftCard":"false","name":"Hurley Black Suits Hat","inStock":"true","id":"1216772","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}}],
          },
          fields: Adapter.extractFields(config),
          collections: Adapter.extractCollections(config, CollectionsReducer.DEFAULT_COLLECTION),
          sorts: Adapter.extractSorts(config),
          page: {
            ...PageReducer.DEFAULTS,
            sizes: Adapter.extractPageSizes(config, PageReducer.DEFAULT_PAGE_SIZE)
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

  export const extractAutocompleteNavigationLabels = (config: Configuration) => {
    return config.autocomplete.navigations;
  };

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

  export const shouldAddPastPurchaseBias = (config: Configuration) =>
    config.recommendations.pastPurchases.biasCount > 0;
}

export default Adapter;
