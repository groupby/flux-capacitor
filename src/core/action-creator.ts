import { Results } from 'groupby-api';
import { Dispatch } from 'redux';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import FluxCapacitor from '../flux-capacitor';
import Actions from './actions';
import Adapters from './adapters';
import * as Events from './events';
import { Request } from './reducers/is-fetching';
import Selectors from './selectors';
import Store from './store';
import { action, Routes } from './utils';

export function createActions(flux: FluxCapacitor) {

  return (meta: () => any) => {
    const metadata = meta();
    const actions = ({
      refreshState: (state: any): Actions.RefreshState =>
        action(Actions.REFRESH_STATE, state, metadata),

      startFetching: (requestType: keyof Store.IsFetching): Actions.IsFetching =>
        action(Actions.IS_FETCHING, requestType, metadata),

      // fetch action creators
      fetchMoreRefinements: (navigationId: string): Actions.FetchMoreRefinements =>
        action(Actions.FETCH_MORE_REFINEMENTS, navigationId),

      fetchProducts: (): Actions.FetchProducts =>
        action(Actions.FETCH_PRODUCTS),

      fetchMoreProducts: (amount: number): Actions.FetchMoreProducts =>
        action(Actions.FETCH_MORE_PRODUCTS, amount),

      fetchAutocompleteSuggestions: (query: string): Actions.FetchAutocompleteSuggestions =>
        action(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query),

      fetchAutocompleteProducts: (query: string): Actions.FetchAutocompleteProducts =>
        action(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, query),

      fetchCollectionCount: (collection: string): Actions.FetchCollectionCount =>
        action(Actions.FETCH_COLLECTION_COUNT, collection),

      fetchProductDetails: (id: string): Actions.FetchProductDetails =>
        action(Actions.FETCH_PRODUCT_DETAILS, id),

      // request action creators
      updateSearch: (search: Actions.Payload.Search): Actions.UpdateSearch =>
        action(Actions.UPDATE_SEARCH, { ...<any>search, query: search.query && search.query.trim() }, {
          ...metadata,
          validator: {
            payload: {
              func: ({ query }) => !!query || query === null,
              msg: 'search term is empty'
            }
          }
        }),

      search: (query: string = Selectors.query(flux.store.getState())) =>
        actions.updateSearch({ query, clear: true }),

      resetRecall: (query: string = null, { field: navigationId, index }: { field: string, index: number } = <any>{}) =>
        actions.updateSearch({ query, navigationId, index, clear: true }),

      resetQuery: () => actions.updateSearch({ query: null }),

      selectRefinement: (navigationId: string, index: number): Actions.SelectRefinement =>
        action(Actions.SELECT_REFINEMENT, { navigationId, index }, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => Selectors.isRefinementDeselected(state, navigationId, index),
              msg: 'navigation does not exist or refinement is already selected'
            }
          }
        }),

      deselectRefinement: (navigationId: string, index: number): Actions.DeselectRefinement =>
        action(Actions.DESELECT_REFINEMENT, { navigationId, index }, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => Selectors.isRefinementSelected(state, navigationId, index),
              msg: 'navigation does not exist or refinement is not selected'
            }
          }
        }),

      selectCollection: (id: string): Actions.SelectCollection =>
        action(Actions.SELECT_COLLECTION, id, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => state.data.collections.selected !== id,
              msg: 'collection is already selected'
            }
          }
        }),

      selectSort: (index: number): Actions.SelectSort =>
        action(Actions.SELECT_SORT, index, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => state.data.sorts.selected !== index,
              msg: 'sort is already selected'
            }
          }
        }),

      updatePageSize: (size: number): Actions.UpdatePageSize =>
        action(Actions.UPDATE_PAGE_SIZE, size, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => Selectors.pageSize(state) !== size,
              msg: 'page size is already selected'
            }
          }
        }),

      updateCurrentPage: (page: number): Actions.UpdateCurrentPage =>
        action(Actions.UPDATE_CURRENT_PAGE, page, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => page !== null && state.data.page.current !== page,
              msg: 'page size is already selected'
            }
          }
        }),

      updateDetails: (id: string, title: string): Actions.UpdateDetails =>
        action(Actions.UPDATE_DETAILS, { id, title }, metadata),

      updateAutocompleteQuery: (query: string): Actions.UpdateAutocompleteQuery =>
        action(Actions.UPDATE_AUTOCOMPLETE_QUERY, query, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => state.data.autocomplete.query !== query,
              msg: 'page size is already selected'
            }
          }
        }),

      // response action creators
      receiveQuery: (query: Actions.Payload.Query): Actions.ReceiveQuery =>
        action(Actions.RECEIVE_QUERY, query, metadata),

      receiveProducts: (res: Results): Actions.Action<string, any>[] => {
        const receiveProducts = action(Actions.RECEIVE_PRODUCTS, res, metadata);
        const state = flux.store.getState();
        const recordCount = Adapters.Search.extractRecordCount(res);

        return receiveProducts.error
          ? [receiveProducts]
          : [
            receiveProducts,
            actions.receiveQuery(Adapters.Search.extractQuery(res)),
            actions.receiveProductRecords(res.records.map(Adapters.Search.extractProduct)),
            actions.receiveNavigations(Adapters.Search.combineNavigations(res)),
            actions.receiveRecordCount(recordCount),
            actions.receiveCollectionCount({
              collection: Selectors.collection(flux.store.getState()),
              count: recordCount
            }),
            actions.receivePage(Adapters.Search.extractPage(state, recordCount)),
            actions.receiveTemplate(Adapters.Search.extractTemplate(res.template)),
          ];
      },

      receiveProductRecords: (products: Store.Product[]): Actions.ReceiveProductRecords =>
        action(Actions.RECEIVE_PRODUCT_RECORDS, products, metadata),

      receiveCollectionCount: (count: Actions.Payload.Collection.Count): Actions.ReceiveCollectionCount =>
        action(Actions.RECEIVE_COLLECTION_COUNT, count, metadata),

      receiveNavigations: (navigations: Store.Navigation[]): Actions.ReceiveNavigations =>
        action(Actions.RECEIVE_NAVIGATIONS, navigations, metadata),

      receivePage: (page: Actions.Payload.Page): Actions.ReceivePage =>
        action(Actions.RECEIVE_PAGE, page, metadata),

      receiveTemplate: (template: Store.Template): Actions.ReceiveTemplate =>
        action(Actions.RECEIVE_TEMPLATE, template, metadata),

      receiveRecordCount: (recordCount: number): Actions.ReceiveRecordCount =>
        action(Actions.RECEIVE_RECORD_COUNT, recordCount, metadata),

      receiveRedirect: (redirect: string): Actions.ReceiveRedirect =>
        action(Actions.RECEIVE_REDIRECT, redirect, metadata),

      // tslint:disable-next-line max-line-length
      receiveMoreRefinements: (navigationId: string, refinements: Store.Refinement[], selected: number[]): Actions.ReceiveMoreRefinements =>
        action(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements, selected }, metadata),

      // tslint:disable-next-line max-line-length
      receiveAutocompleteSuggestions: (suggestions: Actions.Payload.Autocomplete.Suggestions): Actions.ReceiveAutocompleteSuggestions =>
        action(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions, metadata),

      receiveMoreProducts: (products: Store.Product[]): Actions.ReceiveMoreProducts =>
        action(Actions.RECEIVE_MORE_PRODUCTS, products, metadata),

      receiveAutocompleteProducts: (products: Store.Product[]): Actions.ReceiveAutocompleteProducts =>
        action(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, products, metadata),

      receiveDetailsProduct: (product: Store.Product): Actions.ReceiveDetailsProduct =>
        action(Actions.RECEIVE_DETAILS_PRODUCT, product, metadata),

      // ui action creators
      createComponentState: (tagName: string, id: string, state: any = {}): Actions.CreateComponentState =>
        action(Actions.CREATE_COMPONENT_STATE, { tagName, id, state }, metadata),

      removeComponentState: (tagName: string, id: string): Actions.RemoveComponentState =>
        action(Actions.REMOVE_COMPONENT_STATE, { tagName, id }, metadata),

      // app action creators
      startApp: (): Actions.StartApp =>
        action<any, typeof Actions.START_APP, any>(Actions.START_APP, undefined, metadata)
    });

    return actions;
  };
}

export default createActions;
