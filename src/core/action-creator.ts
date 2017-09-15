import { Results } from 'groupby-api';
import FluxCapacitor from '../flux-capacitor';
import Actions from './actions';
import SearchAdapter from './adapters/search';
import Selectors from './selectors';
import Store from './store';
import { action, handleError, refinementPayload } from './utils';

export function createActions(flux: FluxCapacitor) {

  return (meta: () => any) => {
    const metadata = meta();
    const actions = ({
      refreshState: (state: any): Actions.RefreshState =>
        action(Actions.REFRESH_STATE, state, metadata),

      // fetch action creators
      fetchMoreRefinements: (navigationId: string): Actions.FetchMoreRefinements =>
        action(Actions.FETCH_MORE_REFINEMENTS, navigationId, metadata),

      fetchProducts: (): Actions.FetchProducts =>
        action(Actions.FETCH_PRODUCTS, null, metadata),

      fetchMoreProducts: (amount: number): Actions.FetchMoreProducts =>
        action(Actions.FETCH_MORE_PRODUCTS, amount, metadata),

      fetchAutocompleteSuggestions: (query: string): Actions.FetchAutocompleteSuggestions =>
        action(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query, metadata),

      // tslint:disable-next-line max-line-length
      fetchAutocompleteProducts: (query: string, refinements: Actions.Payload.Autocomplete.Refinement[] = []): Actions.FetchAutocompleteProducts =>
        action(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, { query, refinements }, metadata),

      fetchCollectionCount: (collection: string): Actions.FetchCollectionCount =>
        action(Actions.FETCH_COLLECTION_COUNT, collection, metadata),

      fetchProductDetails: (id: string): Actions.FetchProductDetails =>
        action(Actions.FETCH_PRODUCT_DETAILS, id, metadata),

      fetchRecommendationsProducts: () =>
        action(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, null, metadata),

      // request action creators
      updateSearch: (search: Actions.Payload.Search): any => {
        const searchActions: any[] = [actions.resetPage()];

        if ('query' in search) {
          searchActions.push(actions.updateQuery(search.query));
        }
        if ('clear' in search) {
          searchActions.push(actions.resetRefinements(search.clear));
        }
        if ('navigationId' in search) {
          if ('index' in search) {
            searchActions.push(actions.selectRefinement(search.navigationId, search.index));
          } else if (search.range) {
            // add range
          } else {
            // add value
          }
        }

        return searchActions;
      },

      updateQuery: (query: string): Actions.UpdateQuery =>
        action(Actions.UPDATE_QUERY, query && query.trim(), {
          ...metadata,
          validator: {
            payload: [{
              func: (_query) => !!_query || _query === null,
              msg: 'search term is empty'
            }, {
              func: (_query, state) => _query !== Selectors.query(state),
              msg: 'search term is not different'
            }]
          }
        }),

      addRefinement: (field: string, valueOrLow: any, high: any = null): Actions.AddRefinement =>
        action(Actions.ADD_REFINEMENT, refinementPayload(field, valueOrLow, high), {
          ...metadata,
          validator: {
            payload: [{
            //  func: (_, state) => field &&
            }]
          }
        }),

      switchRefinement: (field: string, valueOrLow: any, high: any = null) =>
        actions.updateSearch({ ...refinementPayload(field, valueOrLow, high), clear: field }),

      resetRefinements: (field?: boolean | string): Actions.ResetRefinements =>
        action(Actions.RESET_REFINEMENTS, field, {
          ...metadata,
          validator: {
            payload: [{
              func: () => field === true || typeof field === 'string',
              msg: 'clear must be a string or true'
            }, {
              func: (_, state) => Selectors.selectedRefinements(state).length !== 0,
              msg: 'no refinements to clear'
            }, {
              func: (_, state) => typeof field === 'string' && Selectors.navigation(state, field).selected.length !== 0,
              msg: `no refinements to clear for field "${field}"`
            }]
          }
        }),

      resetPage: (): Actions.ResetPage =>
        action(Actions.RESET_PAGE, undefined, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => Selectors.page(state) !== 1,
              msg: 'page must not be on first page'
            }
          }
        }),

      search: (query: string = Selectors.query(flux.store.getState())) =>
        actions.updateSearch({ query, clear: true }),

      resetRecall: (query: string = null, { field: navigationId, index }: { field: string, index: number } = <any>{}) =>
        actions.updateSearch({ query, navigationId, index, clear: true }),

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
              func: (_, state) => Selectors.collection(state) !== id,
              msg: 'collection is already selected'
            }
          }
        }),

      selectSort: (index: number): Actions.SelectSort =>
        action(Actions.SELECT_SORT, index, {
          ...metadata,
          validator: {
            payload: {
              func: (_, state) => Selectors.sortIndex(state) !== index,
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
              func: (_, state) => page !== null && Selectors.page(state) !== page,
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
              func: (_, state) => Selectors.autocompleteQuery(state) !== query,
              msg: 'suggestions for query have already been requested'
            }
          }
        }),

      // response action creators
      receiveQuery: (query: Actions.Payload.Query): Actions.ReceiveQuery =>
        action(Actions.RECEIVE_QUERY, query, metadata),

      receiveProducts: (res: Results): Actions.Action<string, any>[] | Actions.ReceiveProducts => {
        const receiveProducts = action(Actions.RECEIVE_PRODUCTS, res, metadata);

        return handleError(receiveProducts, () => {
          const state = flux.store.getState();
          const recordCount = SearchAdapter.extractRecordCount(res);

          return [
            receiveProducts,
            actions.receiveQuery(SearchAdapter.extractQuery(res)),
            actions.receiveProductRecords(SearchAdapter.extractProducts(res)),
            actions.receiveNavigations(SearchAdapter.combineNavigations(res)),
            actions.receiveRecordCount(recordCount),
            actions.receiveCollectionCount({
              collection: Selectors.collection(state),
              count: recordCount
            }),
            actions.receivePage(SearchAdapter.extractPage(state, recordCount)),
            actions.receiveTemplate(SearchAdapter.extractTemplate(res.template)),
          ];
        });
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

      receiveAutocompleteProducts: (res: Results): Actions.ReceiveAutocompleteProducts => {
        const receiveProducts = action(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, res, metadata);

        return handleError(receiveProducts, () => [
          receiveProducts,
          actions.receiveAutocompleteProductRecords(SearchAdapter.extractProducts(res)),
          actions.receiveAutocompleteTemplate(SearchAdapter.extractTemplate(res.template)),
        ]);
      },

      receiveAutocompleteProductRecords: (products: Store.Product[]): Actions.ReceiveAutocompleteProductRecords =>
        action(Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, products, metadata),

      receiveAutocompleteTemplate: (template: Store.Template): Actions.ReceiveAutocompleteTemplate =>
        action(Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE, template, metadata),

      receiveDetailsProduct: (product: Store.Product): Actions.ReceiveDetailsProduct =>
        action(Actions.RECEIVE_DETAILS_PRODUCT, product, metadata),

      receiveRecommendationsProducts: (products: Store.Product[]) =>
        action(Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, products, metadata),

      // ui action creators
      createComponentState: (tagName: string, id: string, state: any = {}): Actions.CreateComponentState =>
        action(Actions.CREATE_COMPONENT_STATE, { tagName, id, state }, metadata),

      removeComponentState: (tagName: string, id: string): Actions.RemoveComponentState =>
        action(Actions.REMOVE_COMPONENT_STATE, { tagName, id }, metadata),

      // session action creators
      updateLocation: (location: Store.Geolocation): Actions.UpdateLocation =>
        action(Actions.UPDATE_LOCATION, location, metadata),

      // app action creators
      startApp: (): Actions.StartApp =>
        action<any, typeof Actions.START_APP, any>(Actions.START_APP, undefined, metadata)
    });

    return actions;
  };
}

export default createActions;
