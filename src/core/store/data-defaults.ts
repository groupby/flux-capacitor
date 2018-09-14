import Store from '.';

export const DEFAULT_AREA = 'Production';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_COLLECTION = 'default';

export enum SORT_ENUMS {
  DEFAULT, MOST_PURCHASED, MOST_RECENT
}

const page = {
  current: 1,
  first: 1,
  from: 1,
  sizes: {
    items: [DEFAULT_PAGE_SIZE],
    selected: 0
  },
};

const DEFAULT_STORE: Store.Data = <any>{
  area: DEFAULT_AREA,

  autocomplete: {
    category: { values: [] },
    showCategoryValuesForFirstMatch: false,
    products: [],
    navigations: [],
    suggestions: [],
    searchCharMinLimit: 1,
    template: {},
  },

  collections: {
    allIds: [DEFAULT_COLLECTION],
    byId: { [DEFAULT_COLLECTION]: { name: DEFAULT_COLLECTION } },
  },

  details: {},

  fields: [],

  infiniteScroll: {
    isFetchingForward: false,
    isFetchingBackward: false,
  },

  navigations: {
    allIds: [],
    byId: {},
    sort: [],
  },

  page,

  pastPurchases: {
    defaultSkus: [],
    skus: [],
    saytPastPurchases: [],
    products: [],
    count: {
      currentRecordCount: 0,
      allRecordCount: 0,
    },
    query: '',
    sort: {
      items: [{
        field: 'Default',
        descending: true,
        type: SORT_ENUMS.DEFAULT,
      }, {
        field: 'Most Recent',
        descending: true,
        type: SORT_ENUMS.MOST_RECENT,
      }, {
        field: 'Most Purchased',
        descending: true,
        type: SORT_ENUMS.MOST_PURCHASED,
      }],
      selected: 0,
    },
    navigations: {
      byId: {},
      allIds: [],
    },
    page,
  },

  personalization: {
    biasing: {
      allIds: [],
      byId: {},
    }
  },

  products: [],

  productsLoaded: false,

  query: {
    didYouMean: [],
    related: [],
    rewrites: [],
  },

  recommendations: {
    suggested: {
      products: [],
    },
  },

  recordCount: null,

  redirect: null,

  sorts: {
    items: [],
  },

  template: {},
};

export default DEFAULT_STORE;
