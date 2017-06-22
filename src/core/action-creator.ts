import { Results } from 'groupby-api';
import { Dispatch } from 'redux';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import { Routes } from '.';
import FluxCapacitor from '../flux-capacitor';
import Actions from './actions';
import Adapters from './adapters';
import * as Events from './events';
import Selectors from './selectors';
import Store from './store';
import { action, conditional, thunk } from './utils';

export default function createActions(flux: FluxCapacitor) {

  return (meta: () => any) => {
    const metadata = meta();
    const actions = ({
      refreshState: (state: any): Actions.RefreshState =>
        action(Actions.REFRESH_STATE, state, metadata),

      soFetching: (requestType: keyof Store.IsFetching): Actions.SoFetching =>
        action(Actions.SO_FETCHING, requestType, metadata),

      // fetch action creators
      fetchMoreRefinements: (navigationId: string): Actions.Thunk<any> =>
        (dispatch, getState) => {
          const state = getState();
          if (Selectors.hasMoreRefinements(state, navigationId)) {
            dispatch(actions.soFetching('moreRefinements'));
            return flux.clients.bridge.refinements(Selectors.searchRequest(state), navigationId)
              .then(({ navigation: { name, refinements } }) => {
                const navigation = Selectors.navigation(state, name);
                const navigationType = navigation.range ? 'Range' : 'Value';
                // tslint:disable-next-line max-line-length
                const selectedRefinements = navigation.refinements.filter((_, index) => navigation.selected.includes(index));
                const remapped = refinements.map(Adapters.Search.extractRefinement);

                const selected = [];
                remapped.forEach((refinement, index) => {
                  // tslint:disable-next-line max-line-length
                  const found = selectedRefinements.findIndex((ref) => Adapters.Search.refinementsMatch(<any>refinement, <any>ref, navigationType));
                  if (found !== -1) {
                    selected.push(index);
                  }
                });

                return dispatch(actions.receiveMoreRefinements(name, remapped, selected));
              })
              // this action won't change the state other than to clear fetching flag
              .catch((err) => dispatch(actions.receiveMoreRefinements(null, [], [])));
          }
        },

      fetchProducts: (): Actions.Thunk<any> =>
        (dispatch, getState) => {
          const state = getState();
          if (!state.isFetching.search) {
            dispatch(actions.soFetching('search'));
            return flux.clients.bridge.search(Selectors.searchRequest(state))
              .then((res) => dispatch(actions.receiveSearchResponse(res)))
              .catch((err) => dispatch(actions.receiveSearchResponse(<any>{
                availableNavigation: [],
                selectedNavigation: [],
                records: [],
                didYouMean: [],
                relatedQueries: [],
                rewrites: [],
                totalRecordCount: 0
              })));
          }
        },

      fetchMoreProducts: (amount: number): Actions.Thunk<any> =>
        (dispatch, getState) => {
          const state = getState();
          if (!state.isFetching.moreProducts) {
            dispatch(actions.soFetching('moreProducts'));
            return flux.clients.bridge.search({
              ...Selectors.searchRequest(state),
              pageSize: amount,
              skip: Selectors.products(state).length
            }).then((res) => {
              const products = Adapters.Autocomplete.extractProducts(res);
              dispatch(actions.receiveMoreProducts(products));
              // this action will add 0 new products but clear the fetching flag
            }).catch((err) => dispatch(actions.receiveMoreProducts([])));
          }
        },

      fetchAutocompleteSuggestions: (query: string, config: QueryTimeAutocompleteConfig): Actions.Thunk<any> =>
        (dispatch, getState) => {
          if (query) {
            dispatch(actions.soFetching('autocompleteSuggestions'));
            return flux.clients.sayt.autocomplete(query, config)
              .then((res) => {
                const category = getState().data.autocomplete.category.field;
                const {
                  suggestions,
                  categoryValues,
                  navigations
                } = Adapters.Autocomplete.extractSuggestions(res, category);
                dispatch(actions.receiveAutocompleteSuggestions(suggestions, categoryValues, navigations));
              })
              // this action will clear autocomplete suggestions fetching flag
              .catch((err) => dispatch(actions.receiveAutocompleteSuggestions([], [], [])));
          }
        },

      fetchAutocompleteProducts: (query: string, config: QueryTimeProductSearchConfig): Actions.Thunk<any> =>
        (dispatch) => {
          if (query) {
            dispatch(actions.soFetching('autocompleteProducts'));
            return flux.clients.sayt.productSearch(query, config)
              .then((res) => {
                const products = Adapters.Autocomplete.extractProducts(res);
                dispatch(actions.receiveAutocompleteProducts(products));
              })
              // this action will clear autocomplete products fetching flag
              .catch((err) => dispatch(actions.receiveAutocompleteProducts([])));
          }
        },

      fetchCollectionCount: (collection: string): Actions.Thunk<any> =>
        (dispatch, getState) =>
          flux.clients.bridge.search({ ...Selectors.searchRequest(getState()), collection })
            .then((res) => dispatch(
              actions.receiveCollectionCount(collection, Adapters.Search.extractRecordCount(res)))),

      fetchProductDetails: (id: string): Actions.Thunk<any> =>
        (dispatch, getState) =>
          flux.clients.bridge.search({
            ...Selectors.searchRequest(getState()),
            query: null,
            pageSize: 1,
            skip: 0,
            refinements: [<any>{ navigationName: 'id', type: 'Value', value: id }]
          }).then((res) => dispatch(actions.receiveDetailsProduct(res.records[0].allMeta)))
            .catch((err) => dispatch(actions.receiveDetailsProduct(<any>{}))),

      // request action creators
      updateSearch: (search: Actions.Search): Actions.Thunk<Actions.UpdateSearch> =>
        (dispatch) => {
          const query = search.query && search.query.trim();
          if (query || query === null) {
            dispatch(action(Actions.UPDATE_SEARCH, { ...<any>search, query }, metadata));
          }
        },

      search: (query: string = Selectors.query(flux.store.getState())) =>
        actions.updateSearch({ query, clear: true }),

      resetRecall: (query: string = null, { field: navigationId, index }: { field: string, index: number } = <any>{}) =>
        actions.updateSearch({ query, navigationId, index, clear: true }),

      resetQuery: () => actions.updateSearch({ query: null }),

      selectRefinement: (navigationId: string, index: number): Actions.Thunk<Actions.SelectRefinement> =>
        conditional((state) =>
          Selectors.isRefinementDeselected(state, navigationId, index),
          Actions.SELECT_REFINEMENT, { navigationId, index }, metadata),

      deselectRefinement: (navigationId: string, index: number): Actions.Thunk<Actions.DeselectRefinement> =>
        conditional((state) =>
          Selectors.isRefinementSelected(state, navigationId, index),
          Actions.DESELECT_REFINEMENT, { navigationId, index }, metadata),

      selectCollection: (id: string): Actions.Thunk<Actions.SelectCollection> =>
        conditional((state) =>
          state.data.collections.selected !== id,
          Actions.SELECT_COLLECTION, id, metadata),

      selectSort: (index: number): Actions.Thunk<Actions.SelectSort> =>
        conditional((state) =>
          state.data.sorts.selected !== index,
          Actions.SELECT_SORT, index, metadata),

      updatePageSize: (size: number): Actions.Thunk<Actions.UpdatePageSize> =>
        conditional((state) =>
          Selectors.pageSize(state) !== size,
          Actions.UPDATE_PAGE_SIZE, size, metadata),

      updateCurrentPage: (page: number): Actions.Thunk<Actions.UpdateCurrentPage> =>
        conditional((state) =>
          page !== null && state.data.page.current !== page,
          Actions.UPDATE_CURRENT_PAGE, page, metadata),

      updateDetails: (id: string, title: string): Actions.Thunk<Actions.UpdateDetailsId> =>
        thunk(Actions.UPDATE_DETAILS, { id, title }, metadata),

      updateAutocompleteQuery: (query: string): Actions.Thunk<Actions.UpdateAutocompleteQuery> =>
        conditional((state) =>
          state.data.autocomplete.query !== query,
          Actions.UPDATE_AUTOCOMPLETE_QUERY, query, metadata),

      // response action creators
      receiveSearchResponse: (results: Results): Actions.Thunk<any> =>
        (dispatch, getState) => {
          const updates = [];
          const state = getState();
          if (results.redirect) {
            updates.push(dispatch(actions.receiveRedirect(results.redirect)));
          }
          const recordCount = Adapters.Search.extractRecordCount(results);
          updates.push(
            dispatch(actions.receiveQuery(Adapters.Search.extractQuery(results))),
            dispatch(actions.receiveProducts(results.records.map(Adapters.Search.extractProduct))),
            dispatch(actions.receiveNavigations(Adapters.Search.combineNavigations(results))),
            dispatch(actions.receiveRecordCount(recordCount)),
            dispatch(actions.receiveCollectionCount(Selectors.collection(state), recordCount)),
            dispatch(actions.receivePage(Adapters.Search.extractPage(state, recordCount))),
            dispatch(actions.receiveTemplate(Adapters.Search.extractTemplate(results.template))),
          );

          return Promise.all(updates)
            .then(() => flux.saveState(Routes.SEARCH));
        },

      receiveQuery: (query: Actions.Query): Actions.Thunk<Actions.ReceiveQuery> =>
        thunk(Actions.RECEIVE_QUERY, query, metadata),

      receiveProducts: (products: Store.Product[]): Actions.Thunk<Actions.ReceiveProducts> =>
        thunk(Actions.RECEIVE_PRODUCTS, products, metadata),

      receiveCollectionCount: (collection: string, count: number): Actions.Thunk<Actions.ReceiveCollectionCount> =>
        thunk(Actions.RECEIVE_COLLECTION_COUNT, { collection, count }, metadata),

      receiveNavigations: (navigations: Store.Navigation[]): Actions.Thunk<Actions.ReceiveNavigations> =>
        thunk(Actions.RECEIVE_NAVIGATIONS, navigations, metadata),

      receivePage: (page: Actions.Page): Actions.Thunk<Actions.ReceivePage> =>
        thunk(Actions.RECEIVE_PAGE, page, metadata),

      receiveTemplate: (template: Store.Template): Actions.Thunk<Actions.ReceiveTemplate> =>
        thunk(Actions.RECEIVE_TEMPLATE, template, metadata),

      receiveRecordCount: (recordCount: number): Actions.Thunk<Actions.ReceiveRecordCount> =>
        thunk(Actions.RECEIVE_RECORD_COUNT, recordCount, metadata),

      receiveRedirect: (redirect: string): Actions.Thunk<Actions.ReceiveRedirect> =>
        thunk(Actions.RECEIVE_REDIRECT, redirect, metadata),

      // tslint:disable-next-line max-line-length
      receiveMoreRefinements: (navigationId: string, refinements: Store.Refinement[], selected: number[]): Actions.Thunk<Actions.ReceiveMoreRefinements> =>
        thunk(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements, selected }, metadata),

      // tslint:disable-next-line max-line-length
      receiveAutocompleteSuggestions: (suggestions: string[], categoryValues: string[], navigations: Store.Autocomplete.Navigation[]): Actions.Thunk<Actions.ReceiveAutocompleteSuggestions> =>
        thunk(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, { suggestions, categoryValues, navigations }, metadata),

      receiveMoreProducts: (products: Store.Product[]): Actions.Thunk<Actions.ReceiveMoreProducts> =>
        thunk(Actions.RECEIVE_MORE_PRODUCTS, products, metadata),

      receiveAutocompleteProducts: (products: Store.Product[]): Actions.Thunk<Actions.ReceiveAutocompleteProducts> =>
        thunk(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, products, metadata),

      receiveDetailsProduct: (product: Store.Product): Actions.Thunk<Actions.ReceiveDetailsProduct> =>
        (dispatch: Dispatch<Actions.ReceiveDetailsProduct>) => {
          dispatch(action(Actions.RECEIVE_DETAILS_PRODUCT, product, metadata));
          flux.saveState(Routes.DETAILS);
        },

      // ui action creators
      // tslint:disable-next-line max-line-length
      createComponentState: (tagName: string, id: string, state: any = {}): Actions.Thunk<Actions.CreateComponentState> =>
        thunk(Actions.CREATE_COMPONENT_STATE, { tagName, id, state }, metadata),

      removeComponentState: (tagName: string, id: string): Actions.Thunk<Actions.RemoveComponentState> =>
        thunk(Actions.REMOVE_COMPONENT_STATE, { tagName, id }, metadata),

      // app action creators
      startApp: (): Actions.StartApp =>
        action<any, typeof Actions.START_APP, any>(Actions.START_APP, undefined, metadata)
    });

    return actions;
  };
}

export interface AddRefinement {
  (navigationId: string, value: string): (dispatch: AddRefinement) => void;
  (navigationId: string, low: number, high: number): (dispatch: AddRefinement) => void;
}
