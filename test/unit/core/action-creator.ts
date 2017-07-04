import * as sinon from 'sinon';
import createActions from '../../../src/core/action-creator';
import Actions from '../../../src/core/actions';
import SearchAdapter from '../../../src/core/adapters/search';
import Selectors from '../../../src/core/selectors';
import * as utils from '../../../src/core/utils';
import FluxCapacitor from '../../../src/flux-capacitor';
import suite from '../_suite';

const ACTION = { y: 'z' };

suite('ActionCreator', ({ expect, spy, stub }) => {
  let actions: typeof FluxCapacitor.prototype.actions;
  let flux: any;

  beforeEach(() => actions = createActions(flux = <any>{})(() => null));

  // tslint:disable-next-line max-line-length
  function expectAction<T>(fn: () => Actions.Action<T, any>, type: T, payload?: any, metadataTest?: (meta: any) => any) {
    const createAction = stub(utils, 'action').returns(ACTION);

    const action = fn();

    expect(action).to.eq(ACTION);
    const expectation = expect(createAction);
    const args: any[] = [type, payload];
    if (metadataTest) {
      args.push(sinon.match(metadataTest));
    } else {
      args.push(sinon.match.any);
    }
    expectation.to.be.calledWithExactly(...args);
  }

  describe('application action creators', () => {
    const state = { c: 'd' };

    describe('refreshState()', () => {
      it('should return state with type REFRESH_STATE', () => {
        const created = { f: 'g' };
        const createAction = stub(utils, 'action').returns(created);

        const action = actions.refreshState(state);

        expect(createAction).to.be.calledWith(Actions.REFRESH_STATE, state);
        expect(action).to.eq(created);
      });
    });

    describe('startFetching()', () => {
      it('should return type IS_FETCHING with requestType', () => {
        const requestType = 'search';
        const created = { f: 'g' };
        const createAction = stub(utils, 'action').returns(created);

        const action = actions.startFetching(requestType);

        expect(createAction).to.be.calledWith(Actions.IS_FETCHING, requestType);
        expect(action).to.eq(created);
      });
    });
  });

  describe('fetch action creators', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return an action', () => {
        const navigationId = 'brand';

        expectAction(() => actions.fetchMoreRefinements(navigationId), Actions.FETCH_MORE_REFINEMENTS, navigationId);
      });
    });

    describe('fetchProducts()', () => {
      it('should return an action', () => {
        expectAction(() => actions.fetchProducts(), Actions.FETCH_PRODUCTS, null);
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return an action', () => {
        const amount = 15;

        expectAction(() => actions.fetchMoreProducts(amount), Actions.FETCH_MORE_PRODUCTS, amount);
      });
    });

    describe('fetchAutocompleteSuggestions()', () => {
      it('should return an action', () => {
        const query = 'barbie';

        expectAction(() => actions.fetchAutocompleteSuggestions(query), Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, query);
      });
    });

    describe('fetchAutocompleteProducts()', () => {
      it('should return an action', () => {
        const query = 'barbie';

        expectAction(() => actions.fetchAutocompleteProducts(query), Actions.FETCH_AUTOCOMPLETE_PRODUCTS, query);
      });
    });

    describe('fetchCollectionCount()', () => {
      it('should return an action', () => {
        const collection = 'products';

        expectAction(() => actions.fetchCollectionCount(collection), Actions.FETCH_COLLECTION_COUNT, collection);
      });
    });

    describe('fetchProductDetails()', () => {
      it('should return an action', () => {
        const id = '12345';

        expectAction(() => actions.fetchProductDetails(id), Actions.FETCH_PRODUCT_DETAILS, id);
      });
    });
  });

  describe('request action creators', () => {
    describe('updateSearch()', () => {
      it('should return an action with validation', () => {
        const search: any = { a: 'b' };

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH,
          { ...search, query: undefined },
          (meta) => {
            expect(meta.validator.payload.func({})).to.be.false;
            expect(meta.validator.payload.func({ query: '' })).to.be.false;
            expect(meta.validator.payload.func({ query: undefined })).to.be.false;
            return expect(meta.validator.payload.func({ query: null })).to.be.true;
          });
      });

      it('should trim query', () => {
        const search: any = { query: '  untrimmed \n \r  ' };

        expectAction(() => actions.updateSearch(search), Actions.UPDATE_SEARCH,
          { query: 'untrimmed' });
      });
    });

    describe('search()', () => {
      it('should call actions.updateSearch()', () => {
        const query = 'pineapple';
        const updateSearch = actions.updateSearch = spy();

        actions.search(query);

        expect(updateSearch).to.be.calledWithExactly({ query, clear: true });
      });

      it('should fall back to current query', () => {
        const query = 'pineapple';
        const state = { a: 'b' };
        const updateSearch = actions.updateSearch = spy();
        const selectQuery = stub(Selectors, 'query').returns(query);
        flux.store = { getState: () => state };

        actions.search();

        expect(updateSearch).to.be.calledWithExactly({ query, clear: true });
        expect(selectQuery).to.be.calledWithExactly(state);
      });
    });

    describe('resetRecall()', () => {
      it('should call actions.updateSearch() with falsey params to clear request state', () => {
        const updateSearch = actions.updateSearch = spy();

        actions.resetRecall();

        // tslint:disable-next-line max-line-length
        expect(updateSearch).to.be.calledWithExactly({ query: null, navigationId: undefined, index: undefined, clear: true });
      });

      it('should call actions.updateSearch() with a query', () => {
        const query = 'pineapple';
        const updateSearch = actions.updateSearch = spy();

        actions.resetRecall(query);

        expect(updateSearch).to.be.calledWithExactly({ query, navigationId: undefined, index: undefined, clear: true });
      });

      it('should call actions.updateSearch() with a query and refinement', () => {
        const query = 'pineapple';
        const navigationId = 'brand';
        const index = 9;
        const updateSearch = actions.updateSearch = spy();

        actions.resetRecall(query, { field: navigationId, index });

        expect(updateSearch).to.be.calledWithExactly({ query, navigationId, index, clear: true });
      });
    });

    describe('resetQuery()', () => {
      it('should call actions.updateSearch()', () => {
        const updateSearch = actions.updateSearch = spy();

        actions.resetQuery();

        expect(updateSearch).to.be.calledWithExactly({ query: null });
      });
    });

    describe('selectRefinement()', () => {
      it('should return an action', () => {
        const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);
        const navigationId = 'colour';
        const index = 30;
        const state = { a: 'b' };

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement(navigationId, index), Actions.SELECT_REFINEMENT, { navigationId, index }, (meta) => {
          expect(meta.validator.payload.func(null, state)).to.be.true;
          return expect(isRefinementDeselected).to.be.calledWithExactly(state, navigationId, index);
        });
      });

      it('should invalidate action when refinement not selectable', () => {
        stub(Selectors, 'isRefinementDeselected').returns(false);

        // tslint:disable-next-line max-line-length
        expectAction(() => actions.selectRefinement('colour', 30), Actions.SELECT_REFINEMENT, { navigationId: 'colour', index: 30 }, (meta) => {
          return expect(meta.validator.payload.func(null, {})).to.be.false;
        });
      });

      describe('deselectRefinement()', () => {
        it('should return an action', () => {
          const isRefinementSelected = stub(Selectors, 'isRefinementSelected').returns(true);
          const navigationId = 'colour';
          const index = 30;
          const state = { a: 'b' };

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.deselectRefinement(navigationId, index), Actions.DESELECT_REFINEMENT, { navigationId, index }, (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(isRefinementSelected).to.be.calledWithExactly(state, navigationId, index);
          });
        });

        it('should invalidate action when refinement not deselectable', () => {
          stub(Selectors, 'isRefinementSelected').returns(false);

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.deselectRefinement('colour', 30), Actions.DESELECT_REFINEMENT, { navigationId: 'colour', index: 30 }, (meta) => {
            return expect(meta.validator.payload.func(null, {})).to.be.false;
          });
        });
      });

      describe('selectCollection()', () => {
        it('should return an action', () => {
          const collection = 'otherCollection';
          const state = { a: 'b' };
          const selectCollection = stub(Selectors, 'collection').returns('someCollection');

          expectAction(() => actions.selectCollection(collection), Actions.SELECT_COLLECTION, collection, (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(selectCollection).to.be.calledWith(state);
          });
        });

        it('should invalidate action if collection is already selected', () => {
          const collection = 'otherCollection';
          stub(Selectors, 'collection').returns(collection);

          expectAction(() => actions.selectCollection(collection), Actions.SELECT_COLLECTION, collection, (meta) => {
            return expect(meta.validator.payload.func(null, { a: 'b' })).to.be.false;
          });
        });
      });

      describe('selectSort()', () => {
        it('should return an action', () => {
          const index = 9;
          const state = { a: 'b' };
          const sortIndex = stub(Selectors, 'sortIndex').returns(2);

          expectAction(() => actions.selectSort(index), Actions.SELECT_SORT, index, (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(sortIndex).to.be.calledWith(state);
          });
        });

        it('should invalidate action if sort is already selected', () => {
          const index = 9;
          stub(Selectors, 'sortIndex').returns(index);

          expectAction(() => actions.selectSort(index), Actions.SELECT_SORT, index, (meta) => {
            return expect(meta.validator.payload.func(null, { a: 'b' })).to.be.false;
          });
        });
      });

      describe('updatePageSize()', () => {
        it('should return an action', () => {
          const pageSize = stub(Selectors, 'pageSize').returns(14);
          const size = 12;
          const state = { a: 'b' };

          expectAction(() => actions.updatePageSize(size), Actions.UPDATE_PAGE_SIZE, size, (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(pageSize).to.be.calledWithExactly(state);
          });
        });

        it('should invalidate action if selected page size is the same', () => {
          const size = 12;
          stub(Selectors, 'pageSize').returns(size);

          expectAction(() => actions.updatePageSize(size), Actions.UPDATE_PAGE_SIZE, size, (meta) => {
            return expect(meta.validator.payload.func(null, {})).to.be.false;
          });
        });
      });

      describe('updateCurrentPage()', () => {
        it('should return an action', () => {
          const page = 5;
          const state = { a: 'b' };
          const pageSelector = stub(Selectors, 'page').returns(8);

          expectAction(() => actions.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, page, (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(pageSelector).to.be.calledWith(state);
          });
        });

        it('should invalidate action if page is the same as current page', () => {
          const page = 5;
          stub(Selectors, 'page').returns(page);

          expectAction(() => actions.updateCurrentPage(page), Actions.UPDATE_CURRENT_PAGE, page, (meta) => {
            return expect(meta.validator.payload.func(null, { a: 'b' })).to.be.false;
          });
        });

        it('should invalidate action if page is null', () => {
          expectAction(() => actions.updateCurrentPage(null), Actions.UPDATE_CURRENT_PAGE, null, (meta) => {
            return expect(meta.validator.payload.func(null, {})).to.be.false;
          });
        });
      });

      describe('updateDetails()', () => {
        it('should return an action', () => {
          const id = '4123';
          const title = 'my-product';

          expectAction(() => actions.updateDetails(id, title), Actions.UPDATE_DETAILS, { id, title });
        });
      });

      describe('updateAutocompleteQuery()', () => {
        it('should return an action', () => {
          const query = 'pink elephant';
          const state = { a: 'b' };
          const autocompleteQuery = stub(Selectors, 'autocompleteQuery').returns('red elephant');

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, query, (meta) => {
            expect(meta.validator.payload.func(null, state)).to.be.true;
            return expect(autocompleteQuery).to.be.calledWith(state);
          });
        });

        it('should invalidate action if queries are the same', () => {
          const query = 'pink elephant';
          const state = { a: 'b' };
          stub(Selectors, 'autocompleteQuery').returns(query);

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.updateAutocompleteQuery(query), Actions.UPDATE_AUTOCOMPLETE_QUERY, query, (meta) =>
            expect(meta.validator.payload.func(null, state)).to.be.false);
        });
      });
    });

    describe('response action creators', () => {
      describe('receiveProducts()', () => {
        it('should return a batch action', () => {
          const receiveQueryAction = { aa: 'bb' };
          const receiveProductRecordsAction = { cc: 'dd' };
          const receiveNavigationsAction = { ee: 'ff' };
          const receiveRecordCountAction = { gg: 'hh' };
          const receiveCollectionCountAction = { ii: 'jj' };
          const receivePageAction = { kk: 'll' };
          const receiveTemplateAction = { mm: 'nn' };
          const results: any = {
            records: ['a', 'b'],
            template: { c: 'd' },
          };
          const query: any = { e: 'f' };
          const state: any = { g: 'h' };
          const action = { i: 'j' };
          const navigations: any[] = ['k', 'l'];
          const page: any = { m: 'n' };
          const template: any = { o: 'p' };
          const recordCount = 24;
          const collection = 'myProducts';
          const createAction = stub(utils, 'action').returns(action);
          const extractQuery = stub(SearchAdapter, 'extractQuery').returns(query);
          const combineNavigations = stub(SearchAdapter, 'combineNavigations').returns(navigations);
          const extractProduct = stub(SearchAdapter, 'extractProduct').returns('x');
          const extractPage = stub(SearchAdapter, 'extractPage').returns(page);
          const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
          const extractRecordCount = stub(SearchAdapter, 'extractRecordCount').returns(recordCount);
          const selectCollection = stub(Selectors, 'collection').returns(collection);
          const receiveQuery = actions.receiveQuery = spy(() => receiveQueryAction);
          const receiveProductRecords = actions.receiveProductRecords = spy(() => receiveProductRecordsAction);
          const receiveNavigations = actions.receiveNavigations = spy(() => receiveNavigationsAction);
          const receiveRecordCount = actions.receiveRecordCount = spy(() => receiveRecordCountAction);
          const receiveCollectionCount = actions.receiveCollectionCount = spy(() => receiveCollectionCountAction);
          const receivePage = actions.receivePage = spy(() => receivePageAction);
          const receiveTemplate = actions.receiveTemplate = spy(() => receiveTemplateAction);
          flux.store = { getState: () => state };

          const batchAction = actions.receiveProducts(results);

          expect(createAction).to.be.calledWith(Actions.RECEIVE_PRODUCTS, results);
          expect(receiveQuery).to.be.calledWith(query);
          expect(receiveProductRecords).to.be.calledWith(['x', 'x']);
          expect(receiveNavigations).to.be.calledWith(navigations);
          expect(receiveRecordCount).to.be.calledWith(recordCount);
          expect(receiveTemplate).to.be.calledWith(template);
          expect(receiveCollectionCount).to.be.calledWith({ collection, count: recordCount });
          expect(receivePage).to.be.calledWith(page);
          expect(extractRecordCount).to.be.calledWith(results);
          expect(extractQuery).to.be.calledWith(results);
          expect(extractProduct).to.be.calledWith('a')
            .and.calledWith('b');
          expect(combineNavigations).to.be.calledWith(results);
          expect(selectCollection).to.be.calledWith(state);
          expect(extractPage).to.be.calledWith(state);
          expect(extractTemplate).to.be.calledWith(results.template);
          expect(batchAction).to.eql([
            action,
            receiveQueryAction,
            receiveProductRecordsAction,
            receiveNavigationsAction,
            receiveRecordCountAction,
            receiveCollectionCountAction,
            receivePageAction,
            receiveTemplateAction
          ]);
        });

        it('should return an action', () => {
          const results: any = {
            records: ['a', 'b'],
            template: { c: 'd' },
          };
          const action = { e: 'f', error: true };
          const createAction = stub(utils, 'action').returns(action);

          const batchAction = actions.receiveProducts(results);

          expect(createAction).to.be.calledWith(Actions.RECEIVE_PRODUCTS, results);
          expect(batchAction).to.eql(action);
        });
      });

      describe('receiveQuery()', () => {
        it('should return an action', () => {
          const query: any = { a: 'b' };

          expectAction(() => actions.receiveQuery(query), Actions.RECEIVE_QUERY, query);
        });
      });

      describe('receiveProductRecords()', () => {
        it('should return an action', () => {
          const products: any = ['a', 'b'];

          expectAction(() => actions.receiveProductRecords(products), Actions.RECEIVE_PRODUCT_RECORDS, products);
        });
      });

      describe('receiveCollectionCount()', () => {
        it('should return an action', () => {
          const count = {
            collection: 'products',
            count: 10
          };

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.receiveCollectionCount(count), Actions.RECEIVE_COLLECTION_COUNT, count);
        });
      });

      describe('receiveNavigations()', () => {
        it('should return an action', () => {
          const navigations: any[] = ['a', 'b'];

          expectAction(() => actions.receiveNavigations(navigations), Actions.RECEIVE_NAVIGATIONS, navigations);
        });
      });

      describe('receivePage()', () => {
        it('should return an action', () => {
          const page: any = { a: 'b' };

          expectAction(() => actions.receivePage(page), Actions.RECEIVE_PAGE, page);
        });
      });

      describe('receiveTemplate()', () => {
        it('should return an action', () => {
          const template: any = { a: 'b' };

          expectAction(() => actions.receiveTemplate(template), Actions.RECEIVE_TEMPLATE, template);
        });
      });

      describe('receiveRecordCount()', () => {
        it('should return an action', () => {
          const recordCount = 49;

          expectAction(() => actions.receiveRecordCount(recordCount), Actions.RECEIVE_RECORD_COUNT, recordCount);
        });
      });

      describe('receiveRedirect()', () => {
        it('should return an action', () => {
          const redirect = 'page.html';

          expectAction(() => actions.receiveRedirect(redirect), Actions.RECEIVE_REDIRECT, redirect);
        });
      });

      describe('receiveMoreRefinements()', () => {
        it('should return an action', () => {
          const navigationId = 'brand';
          const refinements: any[] = ['a', 'b'];
          const selected = [1, 7];

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.receiveMoreRefinements(navigationId, refinements, selected), Actions.RECEIVE_MORE_REFINEMENTS, {
            navigationId,
            refinements,
            selected
          });
        });
      });

      describe('receiveAutocompleteSuggestions()', () => {
        it('should return an action', () => {
          const suggestions: any = { a: 'b' };

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.receiveAutocompleteSuggestions(suggestions), Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, suggestions);
        });
      });

      describe('receiveMoreProducts()', () => {
        it('should return an action', () => {
          const products: any[] = ['a', 'b'];

          expectAction(() => actions.receiveMoreProducts(products), Actions.RECEIVE_MORE_PRODUCTS, products);
        });
      });

      describe('receiveAutocompleteProducts()', () => {
        it('should return an action', () => {
          const products: any[] = ['a', 'b'];

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.receiveAutocompleteProducts(products), Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, products);
        });
      });

      describe('receiveDetailsProduct()', () => {
        it('should return an action', () => {
          const product: any = { a: 'b' };

          expectAction(() => actions.receiveDetailsProduct(product), Actions.RECEIVE_DETAILS_PRODUCT, product);
        });
      });

      describe('createComponentState()', () => {
        it('should return an action', () => {
          const tagName = 'my-tag';
          const id = '123';
          const state = { a: 'b' };

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.createComponentState(tagName, id, state), Actions.CREATE_COMPONENT_STATE, { tagName, id, state });
        });
      });

      describe('removeComponentState()', () => {
        it('should create a CREATE_COMPONENT_STATE action', () => {
          const tagName = 'my-tag';
          const id = '123';

          // tslint:disable-next-line max-line-length
          expectAction(() => actions.removeComponentState(tagName, id), Actions.REMOVE_COMPONENT_STATE, { tagName, id });
        });
      });
    });
  });

  describe('refreshState()', () => {
    it('should create a REFRESH_STATE action', () => {
      const payload = { a: 'b' };

      expectAction(() => actions.refreshState(payload), Actions.REFRESH_STATE, payload);
    });
  });

  describe('startApp()', () => {
    it('should return an action', () => {
      expectAction(() => actions.startApp(), Actions.START_APP);
    });
  });
});
