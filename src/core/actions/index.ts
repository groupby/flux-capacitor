import { Results } from 'groupby-api';
import Configuration from '../configuration';
import Store from '../store';

namespace Actions {
  export interface Action<S = string, T = any> {
    type: S;
    payload?: T;
    meta?: Metadata;
    error?: boolean;
  }

  export interface Metadata {
    recallId?: string;
    searchId?: string;
    tag?: Metadata.Tag;
    validator?: object;
  }
  export namespace Metadata {
    export interface Tag {
      id: number;
      name: string;
      origin?: string;
    }
  }

  export interface Thunk<T> {
    (getState?: () => Store.State): Action<T>;
  }

  export interface ActionCreator {
    (...args: any[]): Action | Action[] | Thunk<any>;
  }

  // update actions
  export const UPDATE_AUTOCOMPLETE_QUERY = 'UPDATE_AUTOCOMPLETE_QUERY';
  export type UpdateAutocompleteQuery = Action<typeof UPDATE_AUTOCOMPLETE_QUERY, string>;
  export const UPDATE_DETAILS = 'UPDATE_DETAILS';
  export type UpdateDetails = Action<typeof UPDATE_DETAILS, Store.Product>;
  export const SET_DETAILS = 'SET_DETAILS';
  export type SetDetails = Action<typeof SET_DETAILS, Store.Product>;
  export const SELECT_REFINEMENT = 'SELECT_REFINEMENT';
  export type SelectRefinement = Action<typeof SELECT_REFINEMENT, Payload.Navigation.Refinement>;
  export const DESELECT_REFINEMENT = 'DESELECT_REFINEMENT';
  export type DeselectRefinement = Action<typeof DESELECT_REFINEMENT, Payload.Navigation.Refinement>;
  export const SELECT_COLLECTION = 'SELECT_COLLECTION';
  export type SelectCollection = Action<typeof SELECT_COLLECTION, string>;
  export const SELECT_SORT = 'UPDATE_SORTS';
  export type SelectSort = Action<typeof SELECT_SORT, number>;
  export const UPDATE_PAGE_SIZE = 'UPDATE_PAGE_SIZE';
  export type UpdatePageSize = Action<typeof UPDATE_PAGE_SIZE, number>;
  export const UPDATE_CURRENT_PAGE = 'UPDATE_CURRENT_PAGE';
  export type UpdateCurrentPage = Action<typeof UPDATE_CURRENT_PAGE, number>;
  export const UPDATE_QUERY = 'UPDATE_QUERY';
  export type UpdateQuery = Action<typeof UPDATE_QUERY, string>;
  export const RESET_REFINEMENTS = 'RESET_REFINEMENTS';
  export type ResetRefinements = Action<typeof RESET_REFINEMENTS, boolean | string>;
  export const RESET_PAGE = 'RESET_PAGE';
  export type ResetPage = Action<typeof RESET_PAGE, undefined>;
  export const ADD_REFINEMENT = 'ADD_REFINEMENT';
  export type AddRefinement = Action<typeof ADD_REFINEMENT, Actions.Payload.Navigation.AddRefinement>;
  export const UPDATE_BIASING = 'UPDATE_BIASING';
  export type UpdateBiasing = Action<typeof UPDATE_BIASING, Actions.Payload.Personalization.Biasing>;

  // batch actions
  // tslint:disable-next-line max-line-length
  export type SwitchRefinement = [Actions.ResetPage, Actions.ResetPage, Actions.ResetRefinements, Actions.ResetPage, Actions.AddRefinement];
  export type Search = [Actions.ResetPage, Actions.ResetPage, Actions.ResetRefinements, Actions.ResetPage, Actions.AddRefinement];
  // tslint:disable-next-line max-line-length
  export type ResetRecall = [Actions.ResetPage, Actions.ResetPage, Actions.ResetRefinements, Actions.ResetPage, Actions.UpdateQuery] |
    [Actions.ResetPage, Actions.ResetPage, Actions.ResetRefinements, Actions.ResetPage, Actions.UpdateQuery, Actions.ResetPage, Actions.SelectRefinement];
  // tslint:disable-next-line max-line-length
  export type UpdateSearch = Array<Actions.ResetPage | Actions.UpdateQuery | Actions.ResetRefinements | Actions.SelectRefinement | Actions.AddRefinement>;
  export type ResetPageAndResetRefinements = [Actions.ResetPage, Actions.ResetRefinements];
  export type ResetPageAndSelectRefinement = [Actions.ResetPage, Actions.SelectRefinement];
  export type ResetPageAndDeselectRefinement = [Actions.ResetPage, Actions.DeselectRefinement];
  export type ResetPageAndAddRefinement = [Actions.ResetPage, Actions.AddRefinement];
  export type CheckAndResetRefinements = ResetPageAndResetRefinements | Action<any>[];
  export type ResetPageAndUpdateQuery = [Actions.ResetPage, Actions.UpdateQuery];

  // fetch actions
  export const FETCH_MORE_REFINEMENTS = 'FETCH_MORE_REFINEMENTS';
  export type FetchMoreRefinements = Action<typeof FETCH_MORE_REFINEMENTS, string>;
  export const FETCH_PRODUCTS = 'FETCH_PRODUCTS';
  export type FetchProducts = Action<typeof FETCH_PRODUCTS>;
  export const FETCH_PRODUCTS_WHEN_HYDRATED = 'FETCH_PRODUCTS_WHEN_HYDRATED';
  // tslint:disable-next-line max-line-length
  export type fetchProductsWhenHydrated = Action<typeof FETCH_PRODUCTS_WHEN_HYDRATED, Actions.FetchProducts>;
  export const FETCH_MORE_PRODUCTS = 'FETCH_MORE_PRODUCTS';
  export type FetchMoreProducts = Action<typeof FETCH_MORE_PRODUCTS, number>;
  export const FETCH_AUTOCOMPLETE_SUGGESTIONS = 'FETCH_AUTOCOMPLETE_SUGGESTIONS';
  export type FetchAutocompleteSuggestions = Action<typeof FETCH_AUTOCOMPLETE_SUGGESTIONS, string>;
  export const FETCH_AUTOCOMPLETE_PRODUCTS = 'FETCH_AUTOCOMPLETE_PRODUCTS';
  // tslint:disable-next-line max-line-length
  export type FetchAutocompleteProducts = Action<typeof FETCH_AUTOCOMPLETE_PRODUCTS, { query: string, refinements: Actions.Payload.Autocomplete.Refinement[] }>;
  export const FETCH_COLLECTION_COUNT = 'FETCH_COLLECTION_COUNT';
  export type FetchCollectionCount = Action<typeof FETCH_COLLECTION_COUNT, string>;
  export const FETCH_PRODUCT_DETAILS = 'FETCH_PRODUCT_DETAILS';
  export type FetchProductDetails = Action<typeof FETCH_PRODUCT_DETAILS, string>;
  export const FETCH_RECOMMENDATIONS_PRODUCTS = 'FETCH_RECOMMENDATIONS_PRODUCTS';
  export type FetchRecommendationsProducts = Action<typeof FETCH_RECOMMENDATIONS_PRODUCTS, string>;
  export const FETCH_PAST_PURCHASES = 'FETCH_PAST_PURCHASES';
  export type FetchPastPurchases = Action<typeof FETCH_PAST_PURCHASES, string>;
  export const FETCH_ORDER_HISTORY = 'FETCH_ORDER_HISTORY';
  export type FetchOrderHistory = Action<typeof FETCH_ORDER_HISTORY>;

  // response actions
  export const RECEIVE_MORE_REFINEMENTS = 'RECEIVE_MORE_REFINEMENTS';
  export type ReceiveMoreRefinements = Action<typeof RECEIVE_MORE_REFINEMENTS, Payload.Navigation.MoreRefinements>;
  export const RECEIVE_PRODUCTS = 'RECEIVE_PRODUCTS';
  export type ReceiveProducts = Action<typeof RECEIVE_PRODUCTS, Results>;
  export const RECEIVE_MORE_PRODUCTS = 'RECEIVE_MORE_PRODUCTS';
  export type ReceiveMoreProducts = Action<typeof RECEIVE_MORE_PRODUCTS, Store.ProductWithMetadata[]>;
  export const RECEIVE_AUTOCOMPLETE_SUGGESTIONS = 'RECEIVE_AUTOCOMPLETE_SUGGESTIONS';
  // tslint:disable-next-line max-line-length
  export type ReceiveAutocompleteSuggestions = Action<typeof RECEIVE_AUTOCOMPLETE_SUGGESTIONS, Payload.Autocomplete.Suggestions>;
  export const RECEIVE_AUTOCOMPLETE_PRODUCTS = 'RECEIVE_AUTOCOMPLETE_PRODUCTS';
  export type ReceiveAutocompleteProducts = Action<typeof RECEIVE_AUTOCOMPLETE_PRODUCTS, Store.ProductWithMetadata[]>;
  export const RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS = 'RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS';
  // tslint:disable-next-line max-line-length
  export type ReceiveAutocompleteProductRecords = Action<typeof RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, Store.ProductWithMetadata[]>;
  export const RECEIVE_AUTOCOMPLETE_TEMPLATE = 'RECEIVE_AUTOCOMPLETE_TEMPLATE';
  export type ReceiveAutocompleteTemplate = Action<typeof RECEIVE_AUTOCOMPLETE_TEMPLATE, Store.Template>;
  export const RECEIVE_QUERY = 'RECEIVE_QUERY';
  export type ReceiveQuery = Action<typeof RECEIVE_QUERY, Payload.Query>;
  export const RECEIVE_PRODUCT_RECORDS = 'RECEIVE_PRODUCT_RECORDS';
  export type ReceiveProductRecords = Action<typeof RECEIVE_PRODUCT_RECORDS, Store.ProductWithMetadata[]>;
  export const RECEIVE_COLLECTION_COUNT = 'RECEIVE_COLLECTION_COUNT';
  export type ReceiveCollectionCount = Action<typeof RECEIVE_COLLECTION_COUNT, Payload.Collection.Count>;
  export const RECEIVE_NAVIGATIONS = 'RECEIVE_NAVIGATIONS';
  export type ReceiveNavigations = Action<typeof RECEIVE_NAVIGATIONS, Store.Navigation[]>;
  export const RECEIVE_PAGE = 'RECEIVE_PAGE';
  export type ReceivePage = Action<typeof RECEIVE_PAGE, Payload.Page>;
  export const RECEIVE_RECORD_COUNT = 'RECEIVE_RECORD_COUNT';
  export type ReceiveRecordCount = Action<typeof RECEIVE_RECORD_COUNT, number>;
  export const RECEIVE_TEMPLATE = 'RECEIVE_TEMPLATE';
  export type ReceiveTemplate = Action<typeof RECEIVE_TEMPLATE, Store.Template>;
  export const RECEIVE_REDIRECT = 'RECEIVE_REDIRECT';
  export type ReceiveRedirect = Action<typeof RECEIVE_REDIRECT, string>;
  export const RECEIVE_RECOMMENDATIONS_PRODUCTS = 'RECEIVE_RECOMMENDATIONS_PRODUCTS';
  // tslint:disable-next-line max-line-length
  export type ReceiveRecommendationsProducts = Action<typeof RECEIVE_RECOMMENDATIONS_PRODUCTS, Store.ProductWithMetadata[]>;
  export const RECEIVE_PAST_PURCHASES = 'RECEIVE_PAST_PURCHASES';
  export type ReceivePastPurchases = Action<typeof RECEIVE_PAST_PURCHASES, Store.Recommendations.PastPurchase[]>;
  export const RECEIVE_ORDER_HISTORY = 'RECEIVE_ORDER_HISTORY';
  export type ReceiveOrderHistory = Action<typeof RECEIVE_ORDER_HISTORY, Store.Recommendations.OrderHistoryProduct[]>;
  export const RECEIVE_QUERY_PAST_PURCHASES = 'RECEIVE_QUERY_PAST_PURCHASES';
  // tslint:disable-next-line max-line-length
  export type ReceiveQueryPastPurchases = Action<typeof RECEIVE_QUERY_PAST_PURCHASES, Store.ProductWithMetadata[]>;
  export const RECEIVE_NAVIGATION_SORT = 'RECEIVE_NAVIGATION_SORT';
  // tslint:disable-next-line max-line-length
  export type ReceiveNavigationSort = Action<typeof RECEIVE_NAVIGATION_SORT, Store.Recommendations.Navigation[]>;

  // ui
  export const CREATE_COMPONENT_STATE = 'CREATE_COMPONENT_STATE';
  export type CreateComponentState = Action<typeof CREATE_COMPONENT_STATE, Payload.Component.State>;
  export const REMOVE_COMPONENT_STATE = 'REMOVE_COMPONENT_STATE';
  export type RemoveComponentState = Action<typeof REMOVE_COMPONENT_STATE, Payload.Component.Identifier>;

  // session
  export const UPDATE_LOCATION = 'UPDATE_LOCATION';
  export type UpdateLocation = Action<typeof UPDATE_LOCATION, Store.Geolocation>;

  // app
  export const START_APP = 'START_APP';
  export type StartApp = Action<typeof START_APP, any>;
  export const SHUTDOWN_APP = 'SHUTDOWN_APP';
  export type ShutdownApp = Action<typeof SHUTDOWN_APP>;
  export const REFRESH_STATE = 'REFRESH_STATE';
  export type RefreshState = Action<typeof REFRESH_STATE, any>;
  // added automatically by middleware to interact with redux-undo
  export const SAVE_STATE = 'SAVE_STATE';

  // create
  export const GET_TRACKER_INFO = 'GET_TRACKER_INFO';
  export type GetTrackerInfo = Action<typeof GET_TRACKER_INFO, Payload.Cart.CreateCart>;
  export const CREATE_CART = 'CREATE_CART';
  export type CreateCart = Action<typeof CREATE_CART, Payload.Cart.CreateCart>;
  export const CART_CREATED = 'CART_CREATED';
  export type CartCreated = Action<typeof CART_CREATED, Payload.Cart.CartConfirmation>;

  export namespace Payload {
    export namespace Personalization {
      export interface Biasing {
        field: string;
        value: string;
        bias: Store.Personalization.SingleBias;
        config?: Configuration.Personalization.RealTimeBiasing;
      }
    }

    export namespace Component {
      export interface Identifier {
        tagName: string;
        id: string;
      }

      export interface State extends Identifier {
        state: object;
      }
    }

    export namespace Collection {
      export interface Count {
        collection: string;
        count: number;
      }
    }

    export interface Query {
      corrected?: string;
      related: string[];
      didYouMean: string[];
      rewrites: string[];
    }

    // NOTE: Isn't getting the right type in generated doc for some reason
    export interface Search extends Partial<Navigation.Refinement>, Partial<Navigation.AddRefinement> {
      query?: string;

      /**
       * only for refinements
       * if true, replace refinements with the provided ones
       * if false, add the provided refinements
       */
      clear?: boolean | string;
    }

    export namespace Autocomplete {
      export interface Suggestions {
        suggestions: Store.Autocomplete.Suggestion[];
        categoryValues: string[];
        navigations: Store.Autocomplete.Navigation[];
      }

      export interface Refinement {
        field: string;
        value: string;
      }
    }

    export namespace Navigation {
      export interface Refinement {
        navigationId: string;
        index: number;
      }

      export interface AddRefinement {
        navigationId: string;
        range?: boolean;

        // used to add new value refinement
        value?: string;

        // used to add new range refinement
        low?: number;
        high?: number;
      }

      export interface MoreRefinements {
        navigationId: string;
        refinements: Store.Refinement[];
        selected: number[];
      }
    }

    export interface Page {
      previous: number;
      next: number;
      last: number;
      from: number;
      to: number;
    }

    export namespace Cart {
      // todo: change name
      export interface CreateCart {
        loginId?: string;
        sessionId: string;
        visitorId: string;
      }

      export interface CartConfirmation {
        cartId: string;
      }
    }
  }

}

export default Actions;
