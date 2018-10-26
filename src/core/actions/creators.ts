import { Record, Results, Template } from 'groupby-api';
import Actions from '.';
import PageAdapter from '../adapters/page';
import SearchAdapter from '../adapters/search';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import { createAction, handleError, refinementPayload, shouldResetRefinements } from './utils';
import * as validators from './validators';

namespace ActionCreators {
  /**
   * Updates state with given state.
   * @param  {any}                  state - The state to use.
   * @return {Actions.RefreshState}       - Action with state.
   */
  export function refreshState(state: any): Actions.RefreshState {
    return createAction(Actions.REFRESH_STATE, state);
  }

  // fetch action creators
  /**
   * Makes a request for more refinements for given navigation.
   * @param  {Actions.Payload.Fetch.MoreRefinements} options - An object with the navigationId for
   * the navigation to fetch more refinements against and a request object for override.
   * @return {Actions.FetchMoreRefinements} - Action with `{ navigationId, request }`.
   */
  export function fetchMoreRefinements(options: Actions.Payload.Fetch.MoreRefinements): Actions.FetchMoreRefinements;
  /**
   * Makes a request for more refinements for given navigation.
   * @param  {string} navigationId - The navigationId for the navigation to fetch more refinements against.
   * @return {Actions.FetchMoreRefinements} - Action with `{ navigationId }`.
   */
  export function fetchMoreRefinements(navigationId: string): Actions.FetchMoreRefinements;
  // tslint:disable-next-line typedef
  export function fetchMoreRefinements(options) {
    const opts = typeof options === 'string' ? { navigationId: options } : options;

    return createAction(Actions.FETCH_MORE_REFINEMENTS, opts);
  }

  /**
   * Makes a request for products.
   * @param {Actions.Payload.Fetch.Override} options - An object with a request object for override.
   * @return {Actions.FetchProducts} - Action with `{ request }`.
   */
  export function fetchProducts(options: Actions.Payload.Fetch.Override = {}): Actions.FetchProducts {
    return createAction(Actions.FETCH_PRODUCTS, options);
  }

  /**
   * Makes a request for products without history being set afterwards.
   * @param {Actions.Payload.Fetch.Override} options - An object with a request object for override.
   * @return {Actions.FetchProductsWithoutHistory} - Action with `{ request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchProductsWithoutHistory(options: Actions.Payload.Fetch.Override = {}): Actions.FetchProductsWithoutHistory {
    return createAction(Actions.FETCH_PRODUCTS_WITHOUT_HISTORY, options);
  }

  /**
   * Wrapper for fetchProducts, dispatches it within saga when store is rehydrated
   * @param {Actions.Payload.Fetch.Override} options - An object with a request object for override.
   * @return {Actions.FetchProductsWhenHydrated} - Action with `{ request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchProductsWhenHydrated(options: Actions.Payload.Fetch.Override = {}): Actions.FetchProductsWhenHydrated {
    return createAction(Actions.FETCH_PRODUCTS_WHEN_HYDRATED, ActionCreators.fetchProducts(options));
  }

  /**
   * Makes a request for additional products beyond currently requested products.
   * @param  {Actions.Payload.Fetch.MoreProducts} options - An object with the
   * amount and forward values, and a request object for override
   * @return {Actions.FetchMoreProducts} - Action with `{ amount, forward, request }`.
   */
  export function fetchMoreProducts(options: Actions.Payload.Fetch.MoreProducts);
  /**
   * Makes a request for additional products beyond currently requested products.
   * @param  {number} amount - Amount of more products to fetch.
   * @param  {boolean} forward - `true` to fetch forward
   * @return {Actions.FetchMoreProducts} - Action with `{ amount, forward }`.
   */
  export function fetchMoreProducts(amount: number, forward?: boolean);
  // tslint:disable-next-line typedef
  export function fetchMoreProducts(options, forward = true) {
    const validator = {
      forward: validators.isNotFetching,
    };
    const opts = typeof options === 'number' ? { amount: options, forward } : { forward, ...options };

    return createAction(Actions.FETCH_MORE_PRODUCTS, opts, validator);
  }

  /**
   * Makes a request for autocomplete suggestions.
   * @param  {Actions.Payload.Fetch.AutocompleteSuggestions} options - An object
   * with the query term to fetch autocomplete suggestions against, and a request object for override.
   * @return {Actions.FetchAutocompleteSuggestions} - Action with `{ query, request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchAutocompleteSuggestions(options: Actions.Payload.Fetch.AutocompleteSuggestions): Actions.FetchAutocompleteSuggestions;
  /**
   * Makes a request for autocomplete suggestions.
   * @param  {string} query - Search term to fetch autocomplete suggestions against.
   * @return {Actions.FetchAutocompleteSuggestions} - Action with `{ query }`.
   */
  export function fetchAutocompleteSuggestions(query: string): Actions.FetchAutocompleteSuggestions;
  // tslint:disable-next-line typedef
  export function fetchAutocompleteSuggestions(options): Actions.FetchAutocompleteSuggestions {
    const validator = {
      query: validators.isString,
    };
    const opts = typeof options === 'string' ? { query: options } : options;

    return createAction(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, opts, validator);
  }

  /**
   * Makes a request for autocomplete products.
   * @param  {Actions.Payload.Fetch.AutocompleteProducts} options - An object
   * with the query and refinements, and a request object for override.
   * @return {Actions.FetchAutocompleteProducts} - Action with `{ query, refinements, request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchAutocompleteProducts(options: Actions.Payload.Fetch.AutocompleteProducts): Actions.FetchAutocompleteProducts;
  /**
   * Makes a request for autocomplete products.
   * @param  {string} query - Search term
   * to fetch autocomplete products against.
   * @param  {Actions.Payload.Autocomplete.Refinement[]=[]} refinements - The applied
   * refinements.
   * @return {Actions.FetchAutocompleteProducts} - Action with `{ query, refinements }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchAutocompleteProducts(query: string, refinements?: Actions.Payload.Autocomplete.Refinement[]): Actions.FetchAutocompleteProducts;
  // tslint:disable-next-line typedef
  export function fetchAutocompleteProducts(options, refinements = []): Actions.FetchAutocompleteProducts {
    const validator = {
      query: validators.isValidQuery,
    };
    const opts = typeof options === 'string' || options === null
      ? { query: options, refinements }
      : { refinements, ...options };

    return createAction(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, opts, validator);
  }

  /**
   * Makes a request for the collection count for a given collection.
   * @param  {Actions.Payload.Fetch.CollectionCount} options - An object with the collection name,
   * and a request object for override.
   * @return {Actions.FetchCollectionCount} - Action with `{ collection, request }`.
   */
  export function fetchCollectionCount(options: Actions.Payload.Fetch.CollectionCount): Actions.FetchCollectionCount;
  /**
   * Makes a request for the collection count for a given collection.
   * @param  {string} collection - Collection name.
   * @return {Actions.FetchCollectionCount} - Action with `{ collection }`.
   */
  export function fetchCollectionCount(collection: string): Actions.FetchCollectionCount;
  // tslint:disable-next-line typedef
  export function fetchCollectionCount(options): Actions.FetchCollectionCount {
    const opts = typeof options === 'string' ? { collection: options } : options;

    return createAction(Actions.FETCH_COLLECTION_COUNT, opts);
  }

  /**
   * Makes a request for the details for a given product.
   * @param  {Actions.Payload.Fetch.Details} options - An object with the id for a specific product,
   * and a request object for override.
   * @return {Actions.FetchProductDetails} - Action with `{ id, request }`.
   */
  export function fetchProductDetails(options: Actions.Payload.Fetch.Details): Actions.FetchProductDetails;
  /**
   * Makes a request for the details for a given product.
   * @param  {string} id - The id for a specific product.
   * @return {Actions.FetchProductDetails} - Action with `{ id }`.
   */
  export function fetchProductDetails(id: string): Actions.FetchProductDetails;
  // tslint:disable-next-line typedef
  export function fetchProductDetails(options): Actions.FetchProductDetails {
    const opts = typeof options === 'string' ? { id: options } : options;

    return createAction(Actions.FETCH_PRODUCT_DETAILS, opts);
  }

  /**
   * Makes a request for recommendations products.
   * @param {Actions.Fetch.Override} options - An object with a
   * request object for override.
   * @return {Actions.FetchRecommendationsProducts} - Action with `{ request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchRecommendationsProducts(options: Actions.Payload.Fetch.Override = {}): Actions.FetchRecommendationsProducts {
    return createAction(Actions.FETCH_RECOMMENDATIONS_PRODUCTS, options);
  }

  /**
   * Makes a request for past purchases.
   * @param {Actions.Payload.Fetch.PastPurchases} options - An object with a query string,
   * and a request object for override.
   * @return {Actions.FetchPastPurchases} - Action with `{ query, request }`.
   */
  export function fetchPastPurchases(options?: Actions.Payload.Fetch.PastPurchases): Actions.FetchPastPurchases;
  /**
   * Makes a request for past purchases.
   * @param {string} query - A search term
   * @return {Actions.FetchPastPurchases} - Action with `{ query }`.
   */
  export function fetchPastPurchases(query: string): Actions.FetchPastPurchases;
  // tslint:disable-next-line typedef
  export function fetchPastPurchases(options = {}): Actions.FetchPastPurchases {
    const opts = typeof options === 'string' ? { query: options } : options;

    return createAction(Actions.FETCH_PAST_PURCHASES, opts);
  }

  /**
   * Makes a request for past purchase products.
   * @param {Actions.Payload.Fetch.PastPurchases} options - An object with a request object for override.
   * @return {Actions.FetchPastPurchaseProducts} - Action with `{ query, request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchPastPurchaseProducts(options: Actions.Payload.Fetch.PastPurchases = {}): Actions.FetchPastPurchaseProducts {
    return createAction(Actions.FETCH_PAST_PURCHASE_PRODUCTS, options);
  }

  /**
   * Makes a request for more past purchase products.
   * @param {Actions.Payload.Fetch.MorePastPurchases} options - An object with amount number, forward boolean,
   * and a request object for override.
   * @return {Actions.FetchPastPurchaseProducts} - Action with `{ amount, forward, request }`.
   */
  // tslint:disable-next-line max-line-length
  export function fetchMorePastPurchaseProducts(options: Actions.Payload.Fetch.MorePastPurchases): Actions.FetchMorePastPurchaseProducts;
  /**
   * Makes a request for more past purchase products.
   * @param {number} amount - The amount of additional products to fetch.
   * @param {boolean} forward - Whether to fetch the next page or previous page.
   * and a request object for override.
   * @return {Actions.FetchPastPurchaseProducts} - Action with `{ amount, forward }`.
   */
   // tslint:disable-next-line max-line-length
  export function fetchMorePastPurchaseProducts(amount: number, forward?: boolean): Actions.FetchMorePastPurchaseProducts;
  // tslint:disable-next-line typedef
  export function fetchMorePastPurchaseProducts(options, forward = true): Actions.FetchMorePastPurchaseProducts {
    const opts = typeof options === 'number' ? { amount: options, forward } : { forward, ...options };

    return createAction(Actions.FETCH_MORE_PAST_PURCHASE_PRODUCTS, opts);
  }

  /**
   * Makes a request for sayt past purchases.
   * @param {Actions.Payload.Fetch.PastPurchases} options - An object with a query string,
   * and a request object for override.
   * @return {Actions.FetchPastPurchaseProducts} - Action with `{ query, request }`.
   */
  export function fetchSaytPastPurchases(options: Actions.Payload.Fetch.PastPurchases): Actions.FetchSaytPastPurchases;
  /**
   * Makes a request for sayt past purchases.
   * @param {string} query - A search term.
   * @return {Actions.FetchPastPurchaseProducts} - Action with `{ query }`.
   */
  export function fetchSaytPastPurchases(query: string): Actions.FetchSaytPastPurchases;
  // tslint:disable-next-line typedef
  export function fetchSaytPastPurchases(options): Actions.FetchSaytPastPurchases {
    const opts = typeof options === 'string' ? { query: options } : options;

    return createAction(Actions.FETCH_SAYT_PAST_PURCHASES, opts);
  }

  // request action creators
  /**
   * Updates the search with given parameters.
   * @param  {Actions.Payload.Search} newSearch                - Search object for requested search.
   * @return {Actions.UpdateSearch}                         - Actions with relevant data.
   */
  export function updateSearch(newSearch: Actions.Payload.Search) {
    return (state: Store.State): Actions.UpdateSearch => {
      const searchActions: Actions.UpdateSearch = [ActionCreators.resetPage()];

      if ('query' in newSearch) {
        searchActions.push(...ActionCreators.updateQuery(newSearch.query));
      }
      if ('clear' in newSearch && shouldResetRefinements(newSearch, state)) {
        searchActions.push(...ActionCreators.resetRefinements(newSearch.clear));
      }
      if ('navigationId' in newSearch) {
        if ('index' in newSearch) {
          searchActions.push(...ActionCreators.selectRefinement(newSearch.navigationId, newSearch.index));
        } else if (newSearch.range) {
          searchActions.push(...ActionCreators.addRefinement(newSearch.navigationId, newSearch.low, newSearch.high));
        } else if ('value' in newSearch) {
          searchActions.push(...ActionCreators.addRefinement(newSearch.navigationId, newSearch.value));
        }
      }

      return searchActions;
    };
  }

  /**
   * Updates the search query.
   * @param  {string}                          query - Search term to use.
   * @return {Actions.ResetPageAndUpdateQuery}       - Actions with relevant data.
   */
  export function updateQuery(query: string): Actions.ResetPageAndUpdateQuery {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.UPDATE_QUERY, query && query.trim(), {
        payload: validators.isValidQuery,
      })
    ];
  }

  /**
   * Clears the query.
   * @return {Actions.ResetPageAndUpdateQuery} - Actions with relevant data.
   */
  export function resetQuery(): Actions.ResetPageAndUpdateQuery {
    return ActionCreators.updateQuery(null);
  }

  /**
   * Adds a given refinement to the search.
   * @param  {string}                            field      - The field name for
   * the refinement.
   * @param  {any}                               valueOrLow - Either the value
   * for a value refinement, or the low for a range refinement.
   * @param  {any=null}                          high       - Either the high
   * for a range refinement, or left out for a value refinement.
   * @return {Actions.ResetPageAndAddRefinement}            - Actions with relevant data.
   */
  // tslint:disable-next-line max-line-length
  export function addRefinement(field: string, valueOrLow: any, high: any = null): Actions.ResetPageAndAddRefinement {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.ADD_REFINEMENT, refinementPayload(field, valueOrLow, high), {
        navigationId: validators.isString,
        payload: [
          validators.isRangeRefinement,
          validators.isValidRange,
          validators.isValueRefinement,
          validators.isNotFullRange,
          validators.isRefinementDeselectedByValue
        ]
      })
    ];
  }

  /**
   * Removes all refinements for a given navigation field and adds the given
   * refinement to the search.
   * @param  {string}                   field      - The field name for the navigation.
   * @param  {any}                      valueOrLow - Either the value for a value
   * refinement, or the low for a range refinement.
   * @param  {any=null}                 high       - Either the high for a range
   * refinement, or left out for a value refinement.
   * @return {Actions.SwitchRefinement}            - Actions with relevant data.
   */
  export function switchRefinement(field: string, valueOrLow: any, high: any = null): Actions.SwitchRefinement {
    return <any>[
      ActionCreators.resetPage(),
      ...ActionCreators.resetRefinements(field),
      ...ActionCreators.addRefinement(field, valueOrLow, high)
    ];
  }

  /**
   * Removes the selected refinements from the search.
   * @param  {boolean|string}                   field - true to reset all refinements,
   * or navigationId to reset all refinements on a specific navigation.
   * @return {Actions.ResetPageAndResetRefinements}   - Actions with relevant data.
   */
  export function resetRefinements(field: boolean | string): Actions.ResetPageAndResetRefinements {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.RESET_REFINEMENTS, field, {
        payload: [
          validators.isValidClearField,
          validators.hasSelectedRefinements,
          validators.hasSelectedRefinementsByField
        ]
      })
    ];
  }

  /**
   * Sets the current page in the store to page 1, but does not update the search.
   * @return {Actions.ResetPage} - Action with undefined.
   */
  export function resetPage(): Actions.ResetPage {
    return createAction(Actions.RESET_PAGE, undefined, {
      payload: validators.notOnFirstPage
    });
  }

  /**
   * Performs search with query, removes current refinements.
   * @param  {string} query - Search term to perform search with. If not supplied,
   * search with current query is performed, removing current refinements.
   * @return {[type]}       - Actions with relevant data.
   */
  export function search(query?: string) {
    return (state: Store.State): Actions.Search => {
      const actions: any = [ActionCreators.resetPage()];
      if (Selectors.config(state).search.useDefaultCollection) {
        actions.push(ActionCreators.selectCollection(Selectors.defaultCollection(state)));
      }
      // tslint:disable-next-line max-line-length
      actions.push(...ActionCreators.resetRefinements(true), ...ActionCreators.updateQuery(query || Selectors.query(state)));

      return actions;
    };
  }

  /**
   * Performs a new search with query or selected refinement, and resets recallId.
   * @param  {string=null}        query - The query to use in the search.
   * @param  {[type]}             field - The navigation for the refinement to select.
   * @param  {number}             index - The index for the refinement.
   * @return {Actions.ResetRecall}      - Actions with relevant data.
   */
  // tslint:disable-next-line max-line-length
  export function resetRecall(query: string = null, { field, index }: { field: string, index: number } = <any>{}) {
    return (state: Store.State): Actions.ResetRecall => {
      const resetActions: any[] = ActionCreators.search(query)(state);
      if (field) {
        resetActions.push(...ActionCreators.selectRefinement(field, index));
      }

      return <Actions.ResetRecall>resetActions;
    };
  }

  /**
   * Selects a given refinement based on navigationId and index.
   * @param  {string}                               navigationId - The navigationId for
   * the navigation to fetch more refinements against.
   * @param  {number}                               index        - The index of the refinement
   * intended to be selected.
   * @return {Actions.ResetPageAndSelectRefinement}              - Actions with relevant data.
   */
  export function selectRefinement(navigationId: string, index: number): Actions.ResetPageAndSelectRefinement {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.SELECT_REFINEMENT, { navigationId, index }, {
        payload: validators.isRefinementDeselectedByIndex
      })
    ];
  }

  /**
   * Removes a given refinement based on navigationId and index.
   * @param  {string}                                 navigationId - The navigationId for
   * the navigation to fetch more refinements against.
   * @param  {number}                                 index        - The index of the refinement
   * intended to be selected.
   * @return {Actions.ResetPageAndDeselectRefinement}              - Actions with relevant data.
   */
  export function deselectRefinement(navigationId: string, index: number): Actions.ResetPageAndDeselectRefinement {
    return [
      ActionCreators.resetPage(),
      createAction(Actions.DESELECT_REFINEMENT, { navigationId, index }, {
        payload: validators.isRefinementSelectedByIndex
      })
    ];
  }

  /**
   * Selects a given collection based on id.
   * @param  {string}                   id - The id of the selected collection.
   * @return {Actions.SelectCollection}    - Action with id.
   */
  export function selectCollection(id: string): Actions.SelectCollection {
    return createAction(Actions.SELECT_COLLECTION, id, {
      payload: validators.isCollectionDeselected
    });
  }

  /**
   * Selects a given sort based on index.
   * @param  {number}             index - The index of the selected sort.
   * @return {Actions.SelectSort}       - Action with index.
   */
  export function selectSort(index: number): Actions.SelectSort {
    return createAction(Actions.SELECT_SORT, index, {
      payload: validators.isSortDeselected
    });
  }

  /**
   * Updates the page size to given size.
   * @param  {number}                 size - The size the page is updated to.
   * Must correspond to a size in the pageSize in the store.
   * @return {Actions.UpdatePageSize}      - Action with size.
   */
  export function updatePageSize(size: number): Actions.UpdatePageSize {
    return createAction(Actions.UPDATE_PAGE_SIZE, size, {
      payload: validators.isDifferentPageSize
    });
  }

  /**
   * Updates the current page to the given page.
   * @param  {number}                    page - The page to switch to.
   * @return {Actions.UpdateCurrentPage}      - Action with page.
   */
  export function updateCurrentPage(page: number): Actions.UpdateCurrentPage {
    return createAction(Actions.UPDATE_CURRENT_PAGE, page, {
      payload: [
        validators.isValidPage,
        validators.isOnDifferentPage
      ]
    });
  }

  /**
   * Updates the details product in the store.
   * @param  {Store.Details}         details - The product to use as the details
   * product.
   * @return {Actions.UpdateDetails}         - Action with details.
   */
  export function updateDetails(details: Store.Details): Actions.UpdateDetails {
    return createAction(Actions.UPDATE_DETAILS, details);
  }

  /**
   * Updates the autocomplete query with the given term.
   * @param  {string}                          query - The search term to update
   * the autocomplete query to and get suggestions based on.
   * @return {Actions.UpdateAutocompleteQuery}       - Action with query.
   */
  export function updateAutocompleteQuery(query: string): Actions.UpdateAutocompleteQuery {
    return createAction(Actions.UPDATE_AUTOCOMPLETE_QUERY, query, {
      payload: validators.isDifferentAutocompleteQuery
    });
  }

  /**
   * The biasing object to receive and update biasing with
   * @param  {Actions.Payload.Personalization.Biasing} payload - Biasing object
   * @return {Actions.UpdateBiasing}
   */
  export function updateBiasing(payload: Actions.Payload.Personalization.Biasing) {
    return (state: Store.State): Actions.UpdateBiasing =>
      createAction(Actions.UPDATE_BIASING, {
        ...payload,
        config: Selectors.config(state).personalization.realTimeBiasing,
      }, {
        payload: validators.isValidBias
      });
  }

  export function updateSecuredPayload(payload: Configuration.Recommendations.SecuredPayload) {
    return createAction(Actions.UPDATE_SECURED_PAYLOAD, payload);
  }

  /**
   * The fetch state of infinite scroll request.
   * @param  {Actions.Payload.fetchObj} fetchObj - Whether is fetching forward or
   * backward.
   * @return {Actions.ReceiveInfiniteScroll}        - Action with fetching state object.
   */
  export function infiniteScrollRequestState(fetchObj: Actions.Payload.InfiniteScroll): Actions.ReceiveInfiniteScroll {
    return createAction(Actions.RECEIVE_INFINITE_SCROLL, fetchObj);
  }

  // response action creators
  /**
   * The query object to receive and update state with.
   * @param  {Actions.Payload.Query} query - Query object.
   * @return {Actions.ReceiveQuery}        - Action with query object.
   */
  export function receiveQuery(query: Actions.Payload.Query): Actions.ReceiveQuery {
    return createAction(Actions.RECEIVE_QUERY, query);
  }

  /**
   * The response to receive and update state with.
   * @param  {Results} res - Response object, as returned by the request.
   * @return {[type]}      - Actions with relevant data.
   */
  export function receiveProducts(res: Results) {
    return (state: Store.State): Actions.Action<string, any>[] | Actions.ReceiveProducts => {
      const receiveProductsAction = createAction(Actions.RECEIVE_PRODUCTS, res);

      return handleError(receiveProductsAction, () => {
        const limitedRecordCount = SearchAdapter.extractRecordCount(res.totalRecordCount);

        return [
          receiveProductsAction,
          ActionCreators.receiveQuery(SearchAdapter.extractQuery(res)),
          ActionCreators.receiveProductRecords(SearchAdapter.augmentProducts(res)),
          ActionCreators.receiveNavigations(
            SearchAdapter.pruneRefinements(SearchAdapter.combineNavigations(res), state)),
          ActionCreators.receiveRecordCount(res.totalRecordCount),
          ActionCreators.receiveCollectionCount({
            collection: Selectors.collection(state),
            count: res.totalRecordCount
          }),
          ActionCreators.receivePage(
            limitedRecordCount,
            PageAdapter.currentPage(res.originalRequest.skip, res.originalRequest.pageSize)
          )(state),
          ActionCreators.receiveTemplate(SearchAdapter.extractTemplate(res.template)),
        ];
      });
    };
  }

  /**
   * The products to receive and update the state with.
   * @param  {Store.ProductWithMetadata[]}               products - Products that will be
   * received and updated to in the state.
   * @return {Actions.ReceiveProductRecords}          - Action with products.
   */
  export function receiveProductRecords(products: Store.ProductWithMetadata[]): Actions.ReceiveProductRecords {
    return createAction(Actions.RECEIVE_PRODUCT_RECORDS, products);
  }

  /**
   * The collection count to receive and update the state with.
   * @param  {Actions.Payload.Collection.Count} count - The count to update the
   * collection count to.
   * @return {Actions.ReceiveCollectionCount}         - Action with count.
   */
  export function receiveCollectionCount(count: Actions.Payload.Collection.Count): Actions.ReceiveCollectionCount {
    return createAction(Actions.RECEIVE_COLLECTION_COUNT, count);
  }

  /**
   * The navigations to receive and update state with.
   * @param  {Store.Navigation[]}         navigations - The navigations that
   * state will update to.
   * @return {Actions.ReceiveNavigations}             - Action with navigations.
   */
  export function receiveNavigations(navigations: Store.Navigation[]): Actions.ReceiveNavigations {
    return createAction(Actions.RECEIVE_NAVIGATIONS, navigations);
  }

  /**
   * The page to receive and update state with.
   * @param  {Actions.Payload.Page} page - The page object state will update to.
   * @return {Actions.ReceivePage}       - Action with page.
   */
  export function receivePage(recordCount: number, current?: number) {
    return (state: Store.State): Actions.ReceivePage => {
      return createAction(Actions.RECEIVE_PAGE, SearchAdapter.extractPage(state, recordCount, current));
    };
  }

  /**
   * The template to receive and update state with.
   * @param  {Store.Template}          template - The template state will update
   * to.
   * @return {Actions.ReceiveTemplate}          - Action with template.
   */
  export function receiveTemplate(template: Store.Template): Actions.ReceiveTemplate {
    return createAction(Actions.RECEIVE_TEMPLATE, template);
  }

  /**
   * The record count to receive and update state with.
   * @param  {number}                     recordCount - The record count state
   * will update to.
   * @return {Actions.ReceiveRecordCount}             - Action with recordCount.
   */
  export function receiveRecordCount(recordCount: number): Actions.ReceiveRecordCount {
    return createAction(Actions.RECEIVE_RECORD_COUNT, recordCount);
  }

  /**
   * The redirect to receive and update state with.
   * @param  {string}                  redirect - The redirect state will update
   * to.
   * @return {Actions.ReceiveRedirect}          - Action with redirect.
   */
  export function receiveRedirect(redirect: string): Actions.ReceiveRedirect {
    return createAction(Actions.RECEIVE_REDIRECT, redirect);
  }

  /**
   * The more refinements to receive and update state with.
   * @param  {string}                         navigationId - The navigation the
   * more refinements correspond to.
   * @param  {Store.Refinement[]}             refinements  - The more refinements.
   * @param  {number[]}                       selected     - The selected array,
   * indicating which indexes of the refinements are set to selected.
   * @return {Actions.ReceiveMoreRefinements}              - Action with navigationId, refinements, and selected.
   */
  // tslint:disable-next-line max-line-length
  export function receiveMoreRefinements(navigationId: string, refinements: Store.Refinement[], selected: number[]): Actions.ReceiveMoreRefinements {
    return createAction(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements, selected });
  }

  /**
   * The autocomplete suggestions to receive and update state with.
   * @param  {Actions.Payload.Autocomplete.Suggestions} suggestions - The suggestions
   * to update the state to.
   * @return {Actions.ReceiveAutocompleteSuggestions}               - Action with suggestions.
   */
  // tslint:disable-next-line max-line-length
  export function receiveAutocompleteSuggestions(suggestions: Actions.Payload.Autocomplete.Suggestions): Actions.ReceiveAutocompleteSuggestions {
    return createAction(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions);
  }

  /**
   * The more products to receive and update state with. Products will be added on
   * to the products array in the store.
   * @param  {Store.ProductWithMetadata[]}             products - The products to add to the state.
   * @return {Actions.ReceiveMoreProducts}          - Action with products.
   */
  export function receiveMoreProducts(res: Results) {
    return (state: Store.State): Actions.ReceiveMoreProducts => {
      // tslint:disable-next-line max-line-length
      return handleError(createAction(Actions.RECEIVE_MORE_PRODUCTS, res), () => createAction(Actions.RECEIVE_MORE_PRODUCTS, SearchAdapter.augmentProducts(res)));
    };
  }

  /**
   * The autocomplete response to receive and update state with.
   * @param  {Results}                             res - Response object, as returned in the request.
   * @return {Actions.ReceiveAutocompleteProducts}     - Action and res.
   */
  export function receiveAutocompleteProducts(res: Results) {
    return (state: Store.State): Actions.Action<string, any>[] | Actions.ReceiveAutocompleteProducts => {
      const receiveProductsAction = createAction(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, res);

      return handleError(receiveProductsAction, () => [
        receiveProductsAction,
        ActionCreators.receiveAutocompleteProductRecords(SearchAdapter.augmentProducts(res)),
        ActionCreators.receiveAutocompleteTemplate(SearchAdapter.extractTemplate(res.template)),
      ]);
    };
  }

  /**
   * The autocomplete products to receive and update state with.
   * @param  {Store.ProductWithMetadata[]}                           products - The products to add to the
   * autocomplete state.
   * @return {Actions.ReceiveAutocompleteProductRecords}          - Action with products.
   */
  // tslint:disable-next-line max-line-length
  export function receiveAutocompleteProductRecords(products: Store.ProductWithMetadata[]): Actions.ReceiveAutocompleteProductRecords {
    return createAction(Actions.RECEIVE_AUTOCOMPLETE_PRODUCT_RECORDS, products);
  }

  /**
   * The autocomplete template to receive and update state with.
   * @param  {Store.Template}                      template - The template to add to the
   * autocomplete state.
   * @return {Actions.ReceiveAutocompleteTemplate}          - Action with template.
   */
  export function receiveAutocompleteTemplate(template: Store.Template): Actions.ReceiveAutocompleteTemplate {
    return createAction(Actions.RECEIVE_AUTOCOMPLETE_TEMPLATE, template);
  }

  /**
   * The recommendations products to receive and update state with.
   * @param  {Store.ProductWithMetadata[]}             products - The products to add to the recommendations state.
   * @return {Actions.ReceiveRecommendationsProducts}           - Action with products.
   */
  // tslint:disable-next-line max-line-length
  export function receiveRecommendationsProducts(products: Store.ProductWithMetadata[]): Actions.ReceiveRecommendationsProducts {
    return createAction(Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS, products);
  }

  /**
   * The navigation sort to receive and update navigation sort state with.
   * @param  {Store.Recommendations.Navigation[]} navigations - The navigations to be sorted and order of sort.
   * @return {Actions.ReceiveNavigationSort}                  - Action with navigations.
   */
  // tslint:disable-next-line max-line-length
  export function receiveNavigationSort(navigations: Store.Recommendations.Navigation[]): Actions.ReceiveNavigationSort {
    return createAction(Actions.RECEIVE_NAVIGATION_SORT, navigations);
  }

  /**
   * Sets the details product in the store.
   * @param  {Store.Details}         details - The product to use as the details
   * product.
   * @return {Actions.ReceiveDetails}         - Action with details.
   */
  export function receiveDetails(details: Store.Details): Actions.ReceiveDetails {
    return createAction(Actions.RECEIVE_DETAILS, details);
  }

  // tslint:disable-next-line max-line-length
  export function receivePastPurchaseSkus(products: Store.PastPurchases.PastPurchaseProduct[]): Actions.ReceivePastPurchaseSkus {
    return createAction(Actions.RECEIVE_PAST_PURCHASE_SKUS, products);
  }

  // tslint:disable-next-line max-line-length
  export function receiveSaytPastPurchases(products: Store.ProductWithMetadata[]): Actions.ReceiveSaytPastPurchases {
    return createAction(Actions.RECEIVE_SAYT_PAST_PURCHASES, products);
  }

  // tslint:disable-next-line max-line-length
  export function receivePastPurchaseProducts(products: Store.ProductWithMetadata[]): Actions.ReceivePastPurchaseProducts {
    return createAction(Actions.RECEIVE_PAST_PURCHASE_PRODUCTS, products);
  }

  export function receivePastPurchaseTemplate(template: Store.Template): Actions.ReceivePastPurchaseTemplate {
    return createAction(Actions.RECEIVE_PAST_PURCHASE_TEMPLATE, template);
  }

  export function receiveMorePastPurchaseProducts(res: Results) {
    return (state: Store.State): Actions.ReceiveMorePastPurchaseProducts => {
      // tslint:disable-next-line max-line-length
      return handleError(createAction(Actions.RECEIVE_MORE_PAST_PURCHASE_PRODUCTS, res), () => createAction(Actions.RECEIVE_MORE_PAST_PURCHASE_PRODUCTS, SearchAdapter.augmentProducts(res)));
    };
  }

  // tslint:disable-next-line max-line-length
  export function receivePastPurchaseAllRecordCount(count: number): Actions.ReceivePastPurchaseAllRecordCount {
    return createAction(Actions.RECEIVE_PAST_PURCHASE_ALL_RECORD_COUNT, count);
  }

  // tslint:disable-next-line max-line-length
  export function receivePastPurchaseCurrentRecordCount(count: number): Actions.ReceivePastPurchaseCurrentRecordCount {
    return createAction(Actions.RECEIVE_PAST_PURCHASE_CURRENT_RECORD_COUNT, count);
  }

  // tslint:disable-next-line max-line-length
  export function receivePastPurchaseRefinements(refinements: Store.Navigation[]): Actions.ReceivePastPurchaseRefinements {
    return createAction(Actions.RECEIVE_PAST_PURCHASE_REFINEMENTS, refinements);
  }

  /**
   * In the past purchase section, sets the current page in the store to page 1, but does not update the search.
   * @return {Actions.ResetPastPurchasePage} - Action with undefined.
   */
  export function resetPastPurchasePage(): Actions.ResetPastPurchasePage {
    return createAction(Actions.RESET_PAST_PURCHASE_PAGE, undefined, {
      payload: validators.notOnFirstPastPurchasePage
    });
  }

  /**
   * The page to receive and update state with.
   * @param  {Actions.Payload.recordCount} recordCount - The current recordCount.
   * @param  {Actions.Payload.current} current - The current page.
   * @return {Actions.ReceivePage}       - Action with page.
   */
  export function receivePastPurchasePage(recordCount: number, current?: number, pageSize?: number) {
    return (state: Store.State): Actions.ReceivePastPurchasePage => {
      return createAction(
        Actions.RECEIVE_PAST_PURCHASE_PAGE,
        SearchAdapter.extractPage(state, recordCount, current, pageSize)
      );
    };
  }

  /**
   * In the past purchase section, selects a given refinement based on navigationId and index.
   * @param  {string}                               navigationId - The navigationId for
   * the navigation to fetch more refinements against.
   * @param  {number}                               index        - The index of the refinement
   * intended to be selected.
   * @return {Actions.PastPurchaseSelect}              - Actions with relevant data.
   */
  // tslint:disable-next-line max-line-length
  export function selectPastPurchaseRefinement(navigationId: string, index: number): Actions.PastPurchaseSelect {
    return [
      ActionCreators.resetPastPurchasePage(),
      createAction(Actions.SELECT_PAST_PURCHASE_REFINEMENT, { navigationId, index }, {
        payload: validators.isPastPurchaseRefinementDeselectedByIndex
      })
    ];
  }

  // todo doc
  // tslint:disable-next-line max-line-length
  export function resetAndSelectPastPurchaseRefinement(navigationId: string, index: number): Actions.PastPurchaseResetAndSelect {
    return <Actions.PastPurchaseResetAndSelect>[
      ...ActionCreators.resetPastPurchaseRefinements(true),
      ...ActionCreators.selectPastPurchaseRefinement(navigationId, index),
    ];
  }

  // todo doc
  // tslint:disable-next-line max-line-length
  export function resetPastPurchaseQueryAndSelectRefinement(navigationId: string, index: number): Actions.PastPurchaseQueryAndSelect {
    return <Actions.PastPurchaseQueryAndSelect>[
      ...ActionCreators.updatePastPurchaseQuery(''),
      ...ActionCreators.selectPastPurchaseRefinement(navigationId, index),
    ];
  }

  /**
   * In the past purcahse page, removes a given refinement based on navigationId and index.
   * @param  {string}                                 navigationId - The navigationId for
   * the navigation to fetch more refinements against.
   * @param  {number}                                 index        - The index of the refinement
   * intended to be selected.
   * @return {Actions.ResetPageAndDeselectRefinement}              - Actions with relevant data.
   */
  // tslint:disable-next-line max-line-length
  export function deselectPastPurchaseRefinement(navigationId: string, index: number): Actions.PastPurchaseDeselect {
    return [
      ActionCreators.resetPastPurchasePage(),
      createAction(Actions.DESELECT_PAST_PURCHASE_REFINEMENT, { navigationId, index }, {
        payload: validators.isPastPurchaseRefinementSelectedByIndex
      })
    ];
  }

  /**
   * In the past purchase page, removes the selected refinements from the search.
   * @param  {boolean|string}                   field - true to reset all refinements,
   * or navigationId to reset all refinements on a specific navigation.
   * @return {Actions.PastPurchaseReset}   - Actions with relevant data.
   */
  export function resetPastPurchaseRefinements(field?: boolean | string): Actions.PastPurchaseReset {
    return [
      ActionCreators.resetPastPurchasePage(),
      createAction(Actions.RESET_PAST_PURCHASE_REFINEMENTS, field, {
        payload: [
          validators.isValidClearField,
          validators.hasSelectedPastPurchaseRefinements,
          validators.hasSelectedPastPurchaseRefinementsByField
        ]
      })
    ];
  }

  export function updatePastPurchaseQuery(query: string): Actions.PastPurchaseQuery {
    return <Actions.PastPurchaseQuery>[
      ...ActionCreators.resetPastPurchaseRefinements(true),
      createAction(Actions.UPDATE_PAST_PURCHASE_QUERY, query),
    ];
  }

  /**
   * Updates the past purchase page size to given size.
   * @param  {number}                 size - The size the page is updated to.
   * Must correspond to a size in the pageSize in the store.
   * @return {Actions.UpdatePastPurchasePageSize}      - Action with size.
   */
  export function updatePastPurchasePageSize(size: number): Actions.UpdatePastPurchasePageSize {
    return createAction(Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE, size, {
      payload: validators.isDifferentPastPurchasePageSize
    });
  }

  /**
   * Updates the current page to the given page.
   * @param  {number}                    page - The page to switch to.
   * @return {Actions.UpdatePastPurchaseCurrentPage}      - Action with page.
   */
  export function updatePastPurchaseCurrentPage(page: number): Actions.UpdatePastPurchaseCurrentPage {
    return createAction(Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE, page, {
      payload: [
        validators.isValidPastPurchasePage,
        validators.isOnDifferentPastPurchasePage
      ]
    });
  }

  export function selectPastPurchasesSort(index: number): Actions.PastPurchaseSortActions {
    return [
      ActionCreators.resetPastPurchasePage(),
      createAction(Actions.SELECT_PAST_PURCHASE_SORT, index, {
        payload: validators.isPastPurchasesSortDeselected
      })
    ];
  }

  // ui action creators
  /**
   * Adds state for a given tag to the store.
   * @param  {string}                       tagName - The name of the tag.
   * @param  {string}                       id      - The id of the tag.
   * @param  {any={}}                       state   - The state to add in the store.
   * @return {Actions.CreateComponentState}         - Action with tagName, id, and state.
   */
  // tslint:disable-next-line max-line-length
  export function createComponentState(tagName: string, id: string, state: any = {}): Actions.CreateComponentState {
    return createAction(Actions.CREATE_COMPONENT_STATE, { tagName, id, state });
  }

  /**
   * Removes state for a given tag from the store.
   * @param  {string}                       tagName - The name of the tag.
   * @param  {string}                       id      - The id of the tag.
   * @return {Actions.RemoveComponentState}         Action with tagName and id.
   */
  export function removeComponentState(tagName: string, id: string): Actions.RemoveComponentState {
    return createAction(Actions.REMOVE_COMPONENT_STATE, { tagName, id });
  }

  // session action creators
  /**
   * Updates the location in the store to the given location.
   * @param  {Store.Geolocation}      location - The location to update to.
   * @return {Actions.UpdateLocation}          - Action with location.
   */
  export function updateLocation(location: Store.Geolocation): Actions.UpdateLocation {
    return createAction(Actions.UPDATE_LOCATION, location);
  }

  // app action creators
  /**
   * Fires the START_APP action.
   * @return {Actions.StartApp} - Action with undefined.
   */
  export function startApp(): Actions.StartApp {
    return createAction(Actions.START_APP, undefined);
  }
}

export default ActionCreators;
