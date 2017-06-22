import { Dispatch } from 'redux';
import Store from './store';

namespace Actions {
  export interface Action<S, T = never, M = any> {
    type: S;
    payload?: T;
    metadata?: M;
  }

  export interface Thunk<T> {
    (dispatch: Dispatch<T>, getState?: () => Store.State);
  }

  export const UPDATE_AUTOCOMPLETE_QUERY = 'UPDATE_AUTOCOMPLETE_QUERY';
  export type UpdateAutocompleteQuery = Action<typeof UPDATE_AUTOCOMPLETE_QUERY, string>;
  export const UPDATE_DETAILS = 'UPDATE_DETAILS';
  export type UpdateDetailsId = Action<typeof UPDATE_DETAILS, Payload.Details>;
  export const UPDATE_SEARCH = 'UPDATE_SEARCH';
  export type UpdateSearch = Action<typeof UPDATE_SEARCH, Payload.Search>;
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

  // response actions
  export const RECEIVE_MORE_REFINEMENTS = 'RECEIVE_MORE_REFINEMENTS';
  export type ReceiveMoreRefinements = Action<typeof RECEIVE_MORE_REFINEMENTS, Payload.Navigation.MoreRefinements>;
  export const RECEIVE_MORE_PRODUCTS = 'RECEIVE_MORE_PRODUCTS';
  export type ReceiveMoreProducts = Action<typeof RECEIVE_MORE_PRODUCTS, Store.Product[]>;
  export const RECEIVE_AUTOCOMPLETE_SUGGESTIONS = 'RECEIVE_AUTOCOMPLETE_SUGGESTIONS';
  // tslint:disable-next-line
  export type ReceiveAutocompleteSuggestions = Action<typeof RECEIVE_AUTOCOMPLETE_SUGGESTIONS, Payload.Autocomplete.Suggestions>;
  export const RECEIVE_AUTOCOMPLETE_PRODUCTS = 'RECEIVE_AUTOCOMPLETE_PRODUCTS';
  export type ReceiveAutocompleteProducts = Action<typeof RECEIVE_AUTOCOMPLETE_PRODUCTS, Store.Product[]>;
  export const RECEIVE_DETAILS_PRODUCT = 'RECEIVE_DETAILS_PRODUCT';
  export type ReceiveDetailsProduct = Action<typeof RECEIVE_DETAILS_PRODUCT, Store.Product>;
  export const RECEIVE_QUERY = 'RECEIVE_QUERY';
  export type ReceiveQuery = Action<typeof RECEIVE_QUERY, Payload.Query>;
  export const RECEIVE_PRODUCTS = 'RECEIVE_PRODUCTS';
  export type ReceiveProducts = Action<typeof RECEIVE_PRODUCTS, Store.Product[]>;
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

  // request status
  export const SO_FETCHING = 'SO_FETCHING';
  export type SoFetching = Action<typeof SO_FETCHING, keyof Store.IsFetching>;

  // ui
  export const CREATE_COMPONENT_STATE = 'CREATE_COMPONENT_STATE';
  export type CreateComponentState = Action<typeof CREATE_COMPONENT_STATE, Payload.Component.State>;
  export const REMOVE_COMPONENT_STATE = 'REMOVE_COMPONENT_STATE';
  export type RemoveComponentState = Action<typeof REMOVE_COMPONENT_STATE, Payload.Component.Identifier>;

  // app
  export const START_APP = 'START_APP';
  export type StartApp = Action<typeof START_APP, any>;
  export const SHUTDOWN_APP = 'SHUTDOWN_APP';
  export type ShutdownApp = Action<typeof SHUTDOWN_APP>;
  export const REFRESH_STATE = 'REFRESH_STATE';
  export type RefreshState = Action<typeof REFRESH_STATE, object>;

  export namespace Payload {
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

    export interface Search extends Partial<Navigation.Refinement>, Partial<Navigation.AddRefinement> {
      query?: string;

      /**
       * only for refinements
       * if true, replace refinements with the provided ones
       * if false, add the provided refinements
       */
      clear?: boolean;
    }

    export namespace Autocomplete {
      export interface Suggestions {
        suggestions: string[];
        categoryValues: string[];
        navigations: Store.Autocomplete.Navigation[];
      }
    }

    export interface Details {
      id: string;
      title: string;
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
  }

  export interface Base { type: string; }

  export namespace UI {
    export interface ComponentStateAction extends Base {
      tagName: string;
      id: string;
    }
    export interface CreateComponentState extends ComponentStateAction {
      state: object;
    }
    export type RemoveComponentState = ComponentStateAction;
  }

  export namespace Autocomplete {
    export interface UpdateQuery extends Base {
      query: string;
    }

    export interface ReceiveSuggestions extends Base {
      suggestions: string[];
      categoryValues: string[];
      navigations: Store.Autocomplete.Navigation[];
    }

    export interface ReceiveProducts extends Base {
      products: any[];
    }
  }

  export interface Search {
    query?: string;
    navigationId?: string;

    // used to select existing refinement
    index?: number;

    // used to add new value refinement
    value?: string;

    // used to add new range refinement
    low?: number;
    high?: number;

    /**
     * only for refinements
     * if true, replace refinements with the provided ones
     * if false, add the provided refinements
     */
    clear?: boolean;
  }
  export namespace Search {
    export type Refinement = ValueRefinement | RangeRefinement;

    export interface BaseRefinement {
      field: string;
    }

    export interface ValueRefinement extends BaseRefinement {
      value: string;
    }

    export interface RangeRefinement extends BaseRefinement {
      low?: number;
      high?: number;
    }

    export type UpdateSearch = Base & Actions.Search;
  }

  export namespace Collections {
    export interface SelectCollection extends Base {
      id: string;
    }
    export interface ReceiveCount extends Base {
      collection: string;
      count: number;
    }
  }

  export namespace Details {
    export interface Update extends Base {
      id: string;
      title: string;
    }
    export interface ReceiveProduct extends Base {
      product: Store.Product;
    }
  }

  export namespace Navigation {
    export interface RefinementAction extends Base {
      navigationId: string;
      index: number;
    }
    export type SelectRefinement = RefinementAction;
    export type DeselectRefinement = RefinementAction;
    export interface UpdateSearch extends Partial<RefinementAction> {
      range?: boolean;
      value?: string;
      low?: number;
      high?: number;
      clear?: boolean;
    }
    export interface ReceiveNavigations extends Base {
      navigations: Store.Navigation[];
    }
    export interface ReceiveMoreRefinements extends Base {
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
  export namespace Page {
    export interface UpdateCurrent extends Base {
      page: number;
    }
    export interface UpdateSize extends Base {
      size: number;
    }
    export interface ReceivePage extends Base {
      from: number;
      to: number;
      last: number;
      next: number;
      previous: number;
    }
  }

  export namespace Products {
    export interface ReceiveProducts extends Base {
      products: Store.Product[];
    }
  }

  export interface Query {
    corrected?: string;
    related: string[];
    didYouMean: string[];
    rewrites: string[];
  }
  export namespace Query {
    export interface UpdateOriginal extends Base {
      query: string;
    }
    export interface ReceiveQuery extends Base {
      corrected?: string;
      rewrites: string[];
      didYouMean: string[];
      related: string[];
    }
  }

  export namespace RecordCount {
    export interface ReceiveRecordCount extends Base {
      recordCount: number;
    }
  }

  export namespace Redirect {
    export interface ReceiveRedirect extends Base {
      redirect: string;
    }
  }

  export namespace Sort {
    export interface UpdateSelected extends Base {
      index: number;
    }
  }

  export namespace Template {
    export interface UpdateTemplate extends Base {
      template: Store.Template;
    }
  }

  export interface Paths {
    search: string;
    // details: string;
  }
}

export default Actions;
