import * as sinon from 'sinon';
import { Actions, ActionCreator, Selectors } from '../../../src/core';
import AutocompleteAdapter from '../../../src/core/adapters/autocomplete';
import SearchAdapter from '../../../src/core/adapters/search';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite.only('ActionCreator', ({ expect, spy, stub }) => {
  let actions: ActionCreator;
  const flux: any = { a: 'b' };

  beforeEach(() => actions = new ActionCreator(flux, { search: '/search' }));

  describe('constructor()', () => {
    it('should set properties', () => {
      expect(actions['flux']).to.eq(flux);
      expect(actions['linkMapper']).to.be.a('function');
    });
  });

  describe('fetch action creators', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchMoreRefinements('brand');

        expect(thunk).to.be.a('function');
      });

      it('should not fetch if more refinements not available', () => {
        const navigationId = 'brand';
        const state = { a: 'b' };
        const dispatch = spy();
        const getStore = spy(() => state);
        const hasMoreRefinements = stub(Selectors, 'hasMoreRefinements').returns(false);
        const action = actions.fetchMoreRefinements(navigationId);

        action(dispatch, getStore);

        expect(getStore.called).to.be.true;
        expect(hasMoreRefinements.calledWith(state, navigationId)).to.be.true;
        expect(dispatch.called).to.be.false;
      });

      it('should fetch more refinements', () => {
        const name = 'brand';
        const state: any = { a: 'b' };
        const search = { e: 'f' };
        const action = actions.fetchMoreRefinements(name);
        const refinements = stub().resolves({ navigation: { name, refinements: ['c', 'd'] } });
        const searchRequest = stub(Selectors, 'searchRequest').returns(search);
        stub(Selectors, 'hasMoreRefinements').returns(true);
        stub(actions, 'receiveMoreRefinements');
        stub(SearchAdapter, 'extractRefinement').callsFake((s) => s);
        flux.clients = { bridge: { refinements } };

        return action(() => null, () => state)
          .then(() => {
            expect(searchRequest.calledWith(state)).to.be.true;
            expect(refinements.calledWith(search, name)).to.be.true;
          });
      });

      it('should store more refinements result', () => {
        const name = 'brand';
        const state: any = { a: 'b' };
        const moreRefinementsAction = { e: 'f' };
        const action = actions.fetchMoreRefinements(name);
        const dispatch = spy();
        const extractRefinement = stub(SearchAdapter, 'extractRefinement').callsFake((value) => value);
        const receiveMoreRefinements = stub(actions, 'receiveMoreRefinements').returns(moreRefinementsAction);
        stub(Selectors, 'hasMoreRefinements').returns(true);
        stub(Selectors, 'searchRequest');
        flux.clients = {
          bridge: {
            refinements: stub().resolves({ navigation: { name, refinements: ['c', 'd'] } })
          }
        };

        return action(dispatch, () => state)
          .then(() => {
            expect(extractRefinement.calledWith('c')).to.be.true;
            expect(extractRefinement.calledWith('d')).to.be.true;
            expect(receiveMoreRefinements.calledWith(name, ['c', 'd'])).to.be.true;
            expect(dispatch.calledWith(moreRefinementsAction)).to.be.true;
          });
      });
    });

    describe('fetchProducts()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchProducts();

        expect(thunk).to.be.a('function');
      });

      it('should call flux.clients.bridge.search()', () => {
        const request = { a: 'b' };
        const response = { c: 'd' };
        const state: any = { isFetching: {} };
        const receiveSearchResponseAction = () => null;
        const dispatch = spy();
        const search = stub().resolves(response);
        const searchRequest = stub(Selectors, 'searchRequest').returns(request);
        const receiveSearchResponse = stub(actions, 'receiveSearchResponse').returns(receiveSearchResponseAction);
        const action = actions.fetchProducts();
        flux.clients = { bridge: { search } };

        return action(dispatch, () => state)
          .then(() => {
            expect(searchRequest.calledWith(state)).to.be.true;
            expect(search.calledWith(request)).to.be.true;
            expect(receiveSearchResponse.calledWith(response)).to.be.true;
            expect(dispatch.calledWith(receiveSearchResponseAction)).to.be.true;
          });
      });
    });

    describe('fetchAutocompleteSuggestions()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchAutocompleteSuggestions('', {});

        expect(thunk).to.be.a('function');
      });

      it('should call flux.clients.sayt.autocomplete()', () => {
        const query = 'red app';
        const config = { a: 'b' };
        const response = { c: 'd' };
        const suggestions = ['e', 'f'];
        const categoryValues = ['g', 'h'];
        const receiveAutocompleteSuggestionsAction = () => null;
        const dispatch = spy();
        const autocomplete = stub().resolves(response);
        const extractAutocompleteSuggestions = stub(AutocompleteAdapter, 'extractSuggestions')
          .returns({ suggestions, categoryValues });
        const receiveAutocompleteSuggestions = stub(actions, 'receiveAutocompleteSuggestions')
          .returns(receiveAutocompleteSuggestionsAction);
        const action = actions.fetchAutocompleteSuggestions(query, config);
        flux.clients = { sayt: { autocomplete } };

        return action(dispatch, () => <any>({ data: { autocomplete: { category: { field: 'brand' } } } }))
          .then(() => {
            // expect(autocomplete.calledWith(query, config)).to.be.true;
            // expect(extractAutocompleteSuggestions.calledWith(response)).to.be.true;
            // expect(receiveAutocompleteSuggestions.calledWith(suggestions, categoryValues)).to.be.true;
            // expect(dispatch.calledWith(receiveAutocompleteSuggestionsAction)).to.be.true;
          });
      });
    });

    describe('fetchAutocompleteProducts()', () => {
      it('should return a thunk', () => {
        const thunk = actions.fetchAutocompleteProducts('', {});

        expect(thunk).to.be.a('function');
      });

      it('should call flux.sayt.productSearch()', () => {
        const query = 'red app';
        const config = { a: 'b' };
        const response = { c: 'd' };
        const products = ['e', 'f'];
        const receiveAutocompleteProductsAction = () => null;
        const dispatch = spy();
        const productSearch = stub().resolves(response);
        const extractAutocompleteProducts = stub(AutocompleteAdapter, 'extractProducts').returns(products);
        const receiveAutocompleteProducts = stub(actions, 'receiveAutocompleteProducts')
          .returns(receiveAutocompleteProductsAction);
        const action = actions.fetchAutocompleteProducts(query, config);
        flux.clients = { sayt: { productSearch } };

        return action(dispatch)
          .then(() => {
            expect(productSearch.calledWith(query, config)).to.be.true;
            expect(extractAutocompleteProducts.calledWith(response)).to.be.true;
            expect(receiveAutocompleteProducts.calledWith(products)).to.be.true;
            expect(dispatch.calledWith(receiveAutocompleteProductsAction)).to.be.true;
          });
      });
    });
  });

  describe('request action creators', () => {
    describe('updateSearch()', () => {
      it('should create an UPDATE_SEARCH action', () => {
        const data: any = { a: 'b' };
        const thunk = stub(utils, 'thunk');

        actions.updateSearch(data);

        expect(thunk.calledWith(Actions.UPDATE_SEARCH, data)).to.be.true;
      });
    });

    describe('selectRefinement()', () => {
      it('should create a SELECT_REFINEMENT action', () => {
        const navigationId = 'brand';
        const index = 3;
        const state = { a: 'b' };
        const conditional = stub(utils, 'conditional');
        const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected');

        actions.selectRefinement(navigationId, index);

        expect(conditional.calledWith(sinon.match((predicate) => {
          predicate(state);
          return expect(isRefinementDeselected.calledWith(state, navigationId, index)).to.be.true;
        }), Actions.SELECT_REFINEMENT, { navigationId, index })).to.be.true;
      });
    });

    describe('deselectRefinement()', () => {
      it('should create a DESELECT_REFINEMENT action', () => {
        const navigationId = 'brand';
        const index = 3;
        const state = { a: 'b' };
        const conditional = stub(utils, 'conditional');
        const isRefinementSelected = stub(Selectors, 'isRefinementSelected');

        actions.deselectRefinement(navigationId, index);

        expect(conditional.calledWith(sinon.match((predicate) => {
          predicate(state);
          return expect(isRefinementSelected.calledWith(state, navigationId, index)).to.be.true;
        }), Actions.DESELECT_REFINEMENT, { navigationId, index })).to.be.true;
      });
    });

    describe('selectCollection()', () => {
      it('should create a SELECT_COLLECTION action', () => {
        const id = 'products';
        const conditional = stub(utils, 'conditional');

        actions.selectCollection(id);

        expect(conditional.calledWith(sinon.match((predicate) =>
          predicate({ data: { collections: { selected: 'tutorials' } } })),
          Actions.SELECT_COLLECTION, { id })).to.be.true;
      });
    });

    describe('updateSorts()', () => {
      it('should create a UPDATE_SORTS action', () => {
        const index = 1;
        const conditional = stub(utils, 'conditional');

        actions.selectSort(index);

        expect(conditional.calledWith(sinon.match((predicate) =>
          predicate({ data: { sorts: { selected: 2 } } })),
          Actions.SELECT_SORT, { index })).to.be.true;
      });
    });

    describe('updatePageSize()', () => {
      it('should create an UPDATE_PAGE_SIZE action', () => {
        const size = 34;
        const conditional = stub(utils, 'conditional');

        actions.updatePageSize(size);

        expect(conditional.calledWith(sinon.match((predicate) =>
          predicate({ data: { page: { sizes: { items: [10, 20, 80], selected: 20 } } } })),
          Actions.UPDATE_PAGE_SIZE, { size })).to.be.true;
      });
    });

    describe('updateCurrentPage()', () => {
      it('should create an UPDATE_CURRENT_PAGE action', () => {
        const page = 4;
        const conditional = stub(utils, 'conditional');

        actions.updateCurrentPage(page);

        expect(conditional.calledWith(sinon.match((predicate) =>
          predicate({ data: { page: { current: 3 } } })),
          Actions.UPDATE_CURRENT_PAGE, { page })).to.be.true;
      });
    });

    describe('updateDetailsId()', () => {
      it('should create an UPDATE_CURRENT_PAGE action', () => {
        const id = '123';
        const thunk = stub(utils, 'thunk');

        actions.updateDetailsId(id);

        expect(thunk.calledWith(Actions.UPDATE_DETAILS_ID, { id })).to.be.true;
      });
    });

    describe('updateAutocompleteQuery()', () => {
      it('should create an UPDATE_AUTOCOMPLETE_QUERY action', () => {
        const query = 'William Shake';
        const conditional = stub(utils, 'conditional');

        actions.updateAutocompleteQuery(query);

        expect(conditional.calledWith(sinon.match((predicate) =>
          predicate({ data: { autocomplete: { query: 'Fred Flinsto' } } })),
          Actions.UPDATE_AUTOCOMPLETE_QUERY, { query })).to.be.true;
      });
    });
  });

  describe('response action creators', () => {
    describe('receiveSearchResponse()', () => {
      it('should return a thunk', () => {
        const results: any = {};

        const thunk = actions.receiveSearchResponse(results);

        expect(thunk).to.be.a('function');
      });

      it('should dispatch actions', () => {
        const receiveRedirectAction = () => null;
        const receiveQueryAction = () => null;
        const receiveProductsAction = () => null;
        const receiveNavigationsAction = () => null;
        const receivePageAction = () => null;
        const receiveTemplateAction = () => null;
        const receiveCollectionCountAction = () => null;
        const linkMapper = actions['linkMapper'] = () => null;
        const results: any = {
          availableNavigation: ['d', 'e'],
          records: [
            { allMeta: { u: 'v' } },
            { allMeta: { w: 'x' } },
          ],
          redirect: 'page.html',
          selectedNavigation: ['b', 'c'],
          template: { m: 'n' },
          totalRecordCount: 41,
        };
        const query: any = { y: 'z' };
        const navigations: any[] = ['a', 'b'];
        const page: any = { p: 'q' };
        const template: any = { c: 'd' };
        const state: any = { data: { collections: { selected: 'products' } } };
        const getStore = () => state;
        const dispatch = spy();
        const extractQuery = stub(SearchAdapter, 'extractQuery').returns(query);
        const combineNavigations = stub(SearchAdapter, 'combineNavigations').returns(navigations);
        const extractProduct = stub(SearchAdapter, 'extractProduct').returns('x');
        const extractPage = stub(SearchAdapter, 'extractPage').returns(page);
        const extractTemplate = stub(SearchAdapter, 'extractTemplate').returns(template);
        const receiveRedirect = stub(actions, 'receiveRedirect').returns(receiveRedirectAction);
        const receiveQuery = stub(actions, 'receiveQuery').returns(receiveQueryAction);
        const receiveProducts = stub(actions, 'receiveProducts').returns(receiveProductsAction);
        const receiveNavigations = stub(actions, 'receiveNavigations').returns(receiveNavigationsAction);
        const receivePage = stub(actions, 'receivePage').returns(receivePageAction);
        const receiveTemplate = stub(actions, 'receiveTemplate').returns(receiveTemplateAction);
        const receiveCollectionCount = stub(actions, 'receiveCollectionCount').returns(receiveCollectionCountAction);
        const thunk = actions.receiveSearchResponse(results);

        thunk(dispatch, getStore);

        expect(receiveRedirect.calledWith(results.redirect)).to.be.true;
        expect(dispatch.calledWith(receiveRedirectAction)).to.be.true;
        expect(receiveQuery.calledWith(query)).to.be.true;
        expect(extractQuery.calledWith(results, linkMapper)).to.be.true;
        expect(dispatch.calledWith(receiveQueryAction)).to.be.true;
        expect(receiveProducts.calledWith(['x', 'x'])).to.be.true;
        expect(extractProduct.calledWith({ allMeta: { u: 'v' } })).to.be.true;
        expect(extractProduct.calledWith({ allMeta: { w: 'x' } })).to.be.true;
        expect(dispatch.calledWith(receiveProductsAction)).to.be.true;
        expect(receiveNavigations.calledWith(navigations)).to.be.true;
        expect(combineNavigations.calledWith(results.availableNavigation, results.selectedNavigation)).to.be.true;
        expect(dispatch.calledWith(receiveNavigationsAction)).to.be.true;
        expect(receivePage.calledWith(page)).to.be.true;
        expect(extractPage.calledWith(state)).to.be.true;
        expect(dispatch.calledWith(receivePageAction)).to.be.true;
        expect(receiveTemplate.calledWith(template)).to.be.true;
        expect(extractTemplate.calledWith(results.template)).to.be.true;
        expect(dispatch.calledWith(receiveTemplateAction)).to.be.true;
        expect(receiveCollectionCount.calledWith(state.data.collections.selected, results.totalRecordCount)).to.be.true;
        expect(dispatch.calledWith(receiveCollectionCountAction)).to.be.true;
      });
    });

    describe('receiveQuery()', () => {
      it('should create a RECEIVE_QUERY action', () => {
        const query: any = { a: 'b' };
        const thunk = stub(utils, 'thunk');

        actions.receiveQuery(query);

        expect(thunk.calledWith(Actions.RECEIVE_QUERY, query)).to.be.true;
      });
    });

    describe('receiveProducts()', () => {
      it('should create a RECEIVE_PRODUCTS action', () => {
        const products: any = ['a', 'b'];
        const thunk = stub(utils, 'thunk');

        actions.receiveProducts(products);

        expect(thunk.calledWith(Actions.RECEIVE_PRODUCTS, { products })).to.be.true;
      });
    });

    describe('receiveCollectionCount()', () => {
      it('should create a RECEIVE_NAVIGATIONS action', () => {
        const collection = 'products';
        const count = 10;
        const thunk = stub(utils, 'thunk');

        actions.receiveCollectionCount(collection, count);

        expect(thunk.calledWith(Actions.RECEIVE_COLLECTION_COUNT, { collection, count })).to.be.true;
      });
    });

    describe('receiveNavigations()', () => {
      it('should create a RECEIVE_NAVIGATIONS action', () => {
        const navigations: any[] = ['a', 'b'];
        const thunk = stub(utils, 'thunk');

        actions.receiveNavigations(navigations);

        expect(thunk.calledWith(Actions.RECEIVE_NAVIGATIONS, { navigations })).to.be.true;
      });
    });

    describe('receivePage()', () => {
      it('should create a RECEIVE_PAGE action', () => {
        const page: any = { a: 'b' };
        const thunk = stub(utils, 'thunk');

        actions.receivePage(page);

        expect(thunk.calledWith(Actions.RECEIVE_PAGE, page)).to.be.true;
      });
    });

    describe('receiveTemplate()', () => {
      it('should create a RECEIVE_PAGE action', () => {
        const template: any = { a: 'b' };
        const thunk = stub(utils, 'thunk');

        actions.receiveTemplate(template);

        expect(thunk.calledWith(Actions.RECEIVE_TEMPLATE, { template })).to.be.true;
      });
    });

    describe('receiveRedirect()', () => {
      it('should create a RECEIVE_PAGE action', () => {
        const redirect = 'page.html';
        const thunk = stub(utils, 'thunk');

        actions.receiveRedirect(redirect);

        expect(thunk.calledWith(Actions.RECEIVE_REDIRECT, { redirect })).to.be.true;
      });
    });

    describe('receiveMoreRefinements()', () => {
      it('should create a RECEIVE_MORE_REFINEMENTS action', () => {
        const navigationId = 'brand';
        const refinements: any[] = ['a', 'b'];
        const thunk = stub(utils, 'thunk');

        actions.receiveMoreRefinements(navigationId, refinements);

        expect(thunk.calledWith(Actions.RECEIVE_MORE_REFINEMENTS, { navigationId, refinements })).to.be.true;
      });
    });

    describe('receiveAutocompleteSuggestions()', () => {
      it('should create a RECEIVE_AUTOCOMPLETE_SUGGESTIONS action', () => {
        const suggestions = ['a', 'b'];
        const categoryValues = ['c', 'd'];
        const navigations: any[] = ['e', 'f'];
        const thunk = stub(utils, 'thunk');

        actions.receiveAutocompleteSuggestions(suggestions, categoryValues, navigations);

        expect(thunk.calledWith(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, {
          suggestions,
          categoryValues,
          navigations
        })).to.be.true;
      });
    });

    describe('receiveDetailsProduct()', () => {
      it('should create a RECEIVE_DETAILS_PRODUCT action', () => {
        const product: any = { a: 'b' };
        const thunk = stub(utils, 'thunk');

        actions.receiveDetailsProduct(product);

        expect(thunk.calledWith(Actions.RECEIVE_DETAILS_PRODUCT, { product })).to.be.true;
      });
    });
  });
});
