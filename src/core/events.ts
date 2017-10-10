namespace Events {
  /**
   * Triggered when the original query is updated.
   */
  export const ORIGINAL_QUERY_UPDATED = 'original_query_updated'; // pre
  /**
   * Triggered when the corrected query is updated.
   */
  export const CORRECTED_QUERY_UPDATED = 'corrected_query_updated'; // post
  /**
   * Triggered when related queries are updated.
   */
  export const RELATED_QUERIES_UPDATED = 'related_queries_updated'; // post
  /**
   * Triggered when did you means are updated.
   */
  export const DID_YOU_MEANS_UPDATED = 'did_you_means_updated'; // post
  /**
   * Triggered when query rewrites are updated.
   */
  export const QUERY_REWRITES_UPDATED = 'query_rewrites_updated'; // post

  // sort events
  /**
   * Triggered when sorts are updated.
   */
  export const SORTS_UPDATED = 'sorts_updated'; // mixed

  // product events
  /**
   * Triggered when products are updated.
   */
  export const PRODUCTS_UPDATED = 'products_updated'; // mixed

  // collection events
  /**
   * Triggered when collection object is updated.
   */
  export const COLLECTION_UPDATED = 'collection_updated'; // post
  /**
   * Triggered when selected collection is updated.
   */
  export const SELECTED_COLLECTION_UPDATED = 'selected_collection_updated'; // post

  // navigation events
  /**
   * Triggered when navigations are updated.
   */
  export const NAVIGATIONS_UPDATED = 'navigations_updated'; // post
  /**
   * Triggered when selected refinements are updated.
   */
  export const SELECTED_REFINEMENTS_UPDATED = 'selected_refinements_updated'; // post

  // autocomplete events
  /**
   * Triggered when autocomplete query is updated.
   */
  export const AUTOCOMPLETE_QUERY_UPDATED = 'autocomplete_query_updated'; // pre
  /**
   * Triggered when autocomplete suggestions are updated.
   */
  export const AUTOCOMPLETE_SUGGESTIONS_UPDATED = 'autocomplete_suggestions_updated'; // post
  /**
   * Triggered when autocomplete product suggestions are updated.
   */
  export const AUTOCOMPLETE_PRODUCTS_UPDATED = 'autocomplete_products_updated'; // post
  /**
   * Triggered when autocomplete template is updated.
   */
  export const AUTOCOMPLETE_TEMPLATE_UPDATED = 'autocomplete_template_updated'; // post

  // template events
  /**
   * Triggered when template is updated.
   */
  export const TEMPLATE_UPDATED = 'template_updated'; // post

  // details events
  /**
   * Triggered when details page is updated.
   */
  export const DETAILS_UPDATED = 'details_updated'; // pre
  /**
   * Triggered when details product is updated.
   */
  export const DETAILS_PRODUCT_UPDATED = 'details_product_updated'; // post

  // page events
  /**
   * Triggered when page object is updated.
   */
  export const PAGE_UPDATED = 'page_updated'; // post
  /**
   * Triggered when page size is updated.
   */
  export const PAGE_SIZE_UPDATED = 'page_size_updated'; // pre
  /**
   * Triggered when current page is updated.
   */
  export const CURRENT_PAGE_UPDATED = 'current_page_updated'; // pre

  // record count event
  /**
   * Triggered when record count is updated.
   */
  export const RECORD_COUNT_UPDATED = 'record_count_updated'; // post

  // request state change events
  export const RECALL_CHANGED = 'recall_changed';
  export const SEARCH_CHANGED = 'search_changed';

  // redirect event
  /**
   * Triggered when redirect occurs.
   */
  export const REDIRECT = 'redirect';

  // recommendations events
  /**
   * Triggered when recommendations products are updated.
   */
  export const RECOMMENDATIONS_PRODUCTS_UPDATED = 'recommendations_products_updated';

  // error events
  /**
   * Triggered when a bridge error occurs.
   */
  export const ERROR_BRIDGE = 'error:bridge';
  /**
   * Triggered when a fetch action error occurs.
   */
  export const ERROR_FETCH_ACTION = 'error:fetch_action';

  // ui events
  /**
   * Triggered when the UI section of the store is updated.
   */
  export const UI_UPDATED = 'ui:updated';

  // app events
  /**
   * Triggered when the app is started.
   */
  export const APP_STARTED = 'app:started';
  /**
   * Triggered when the app is killed.
   */
  export const APP_KILLED = 'app:killed';

  // location events
  /**
   * Triggered when the location is updated.
   */
  export const LOCATION_UPDATED = 'location:updated';

  // tracker events
  /**
   * Triggered when a search beacon is sent.
   */
  export const BEACON_SEARCH = 'beacon:search';
  /**
   * Triggered when a view product beacon is sent.
   */
  export const BEACON_VIEW_PRODUCT = 'beacon:view_product';
  /**
   * Triggered when an add to cart beacon is sent.
   */
  export const BEACON_ADD_TO_CART = 'beacon:add_to_cart';
  /**
   * Triggered when a remove from cart beacon is sent.
   */
  export const BEACON_REMOVE_FROM_CART = 'beacon:remove_from_cart';
  /**
   * Triggered when a view cart beacon is sent.
   */
  export const BEACON_VIEW_CART = 'beacon:view_cart';
  /**
   * Triggered when an order beacon is sent.
   */
  export const BEACON_ORDER = 'beacon:order';

  // observer events
  /**
   * INTERNAL EVENT: Triggered when an observer node has changed.
   */
  export const OBSERVER_NODE_CHANGED = 'observer:node_changed';

  // tag events
  export const TAG_LIFECYCLE = 'tag:lifecycle';
  export const TAG_ALIASING = 'tag:aliasing';

  // history events
  /**
   * Triggered when history is saved.
   */
  export const HISTORY_SAVE = 'history:save';

  // url events
  /**
   * Triggered when the url is updated.
   */
  export const URL_UPDATED = 'url:updated';
}

export default Events;
