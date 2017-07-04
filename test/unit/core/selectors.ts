import * as sinon from 'sinon';
import ConfigAdapter from '../../../src/core/adapters/configuration';
import { MAX_RECORDS } from '../../../src/core/adapters/search';
import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('selectors', ({ expect, stub }) => {

  describe('searchRequest()', () => {
    const remainingRecords = 2;
    const originalPageSize = MAX_RECORDS - 1;
    const originalSkip = MAX_RECORDS - remainingRecords;
    let sortSelector: sinon.SinonStub;
    let requestSortSelector: sinon.SinonStub;

    beforeEach(() => {
      sortSelector = stub(Selectors, 'sort');
      requestSortSelector = stub(Selectors, 'requestSort');
      stub(Selectors, 'area');
      stub(Selectors, 'fields');
      stub(Selectors, 'query');
      stub(Selectors, 'collection');
      stub(Selectors, 'selectedRefinements');
      stub(Selectors, 'pageSize').returns(originalPageSize);
      stub(Selectors, 'skip').returns(originalSkip);
    });

    it('should decrease page size to prevent exceeding MAX_RECORDS', () => {
      const { pageSize, skip } = Selectors.searchRequest(<any>{}, <any>{ search: {} });

      expect(pageSize).to.eq(remainingRecords);
      expect(skip).to.eq(originalSkip);
    });

    it('should include language when truthy', () => {
      const language = 'en';
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);

      const request = Selectors.searchRequest(<any>{}, <any>{ search: {} });

      expect(request.language).to.eq(language);
    });

    it('should include sort when truthy', () => {
      const sort = { a: 'b' };
      sortSelector.returns(true);
      requestSortSelector.returns(sort);

      const request = Selectors.searchRequest(<any>{}, <any>{ search: {} });

      expect(request.sort).to.eq(sort);
    });

    it('should apply defaults', () => {
      const defaults = { a: 'b', c: 'd' };

      const request: any = Selectors.searchRequest(<any>{}, <any>{ search: { defaults } });

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d');
    });

    it('should apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };

      const request = Selectors.searchRequest(<any>{}, <any>{ search: { overrides } });

      expect(request.pageSize).to.eq(pageSize);
      expect(request.skip).to.eq(skip);
    });

    it('should override defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      const overrides = { c: 'd1' };

      const request: any = Selectors.searchRequest(<any>{}, <any>{ search: { defaults, overrides } });

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });

  describe('autocompleteSuggestionsRequest()', () => {
    it('should create a suggestions request', () => {
      const area = 'myArea';
      const language = 'en';
      const suggestionCount = 31;
      const navigationCount = 3;
      const config: any = {
        autocomplete: {
          area,
          language,
          suggestionCount,
          navigationCount,
          alphabetical: true,
          fuzzy: true,
          defaults: {},
          overrides: {},
        }
      };

      const request = Selectors.autocompleteSuggestionsRequest(config);

      expect(request).to.eql({
        language,
        numSearchTerms: suggestionCount,
        numNavigations: navigationCount,
        sortAlphabetically: true,
        fuzzyMatch: true,
      });
    });

    it('should apply overrides', () => {
      const language = 'fr';
      const config: any = {
        autocomplete: {
          language: 'en',
          defaults: {},
          overrides: { suggestions: { language } },
        }
      };

      const request: any = Selectors.autocompleteSuggestionsRequest(config);

      expect(request.language).to.eq(language);
    });

    it('should apply defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { suggestions: { c: 'd' } },
          overrides: {},
        }
      };

      const request: any = Selectors.autocompleteSuggestionsRequest(config);

      expect(request.c).to.eq('d');
    });

    it('should override defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { suggestions: { c: 'd' } },
          overrides: { suggestions: { a: 'b', c: 'd1' } },
        }
      };

      const request: any = Selectors.autocompleteSuggestionsRequest(config);

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });

  describe('autocompleteProductsRequest()', () => {
    it('should create a products request', () => {
      const area = 'myArea';
      const language = 'en';
      const productCount = 41;
      const config: any = {
        autocomplete: {
          area,
          language,
          productCount,
          defaults: {},
          overrides: {},
        }
      };

      const request = Selectors.autocompleteProductsRequest(config);

      expect(request).to.eql({
        area,
        language,
        numProducts: productCount
      });
    });

    it('should apply overrides', () => {
      const language = 'fr';
      const config: any = {
        autocomplete: {
          language: 'en',
          defaults: {},
          overrides: { products: { language } },
        }
      };

      const request: any = Selectors.autocompleteProductsRequest(config);

      expect(request.language).to.eq(language);
    });

    it('should apply defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { products: { c: 'd' } },
          overrides: {},
        }
      };

      const request: any = Selectors.autocompleteProductsRequest(config);

      expect(request.c).to.eq('d');
    });

    it('should override defaults', () => {
      const config: any = {
        autocomplete: {
          defaults: { products: { c: 'd' } },
          overrides: { products: { a: 'b', c: 'd1' } },
        }
      };

      const request: any = Selectors.autocompleteProductsRequest(config);

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });

  describe('area()', () => {
    it('should select the global area from state', () => {
      const area = 'myArea';
      const state: any = { data: { present: { area } } };

      expect(Selectors.area(state)).to.eq(area);
    });
  });

  describe('fields()', () => {
    it('should select the fields from state', () => {
      const fields = ['a', 'b'];
      const state: any = { data: { present: { fields } } };

      expect(Selectors.fields(state)).to.eq(fields);
    });
  });

  describe('query()', () => {
    it('should select the original query from state', () => {
      const query = 'pineapple';
      const state: any = { data: { present: { query: { original: query } } } };

      expect(Selectors.query(state)).to.eq(query);
    });
  });

  describe('requestSort()', () => {
    it('should transform state sort into request sort', () => {
      const field = 'price';

      expect(Selectors.requestSort({ field, descending: true })).to.eql({ field, order: 'Descending' });
    });

    it('should ignore ascending order', () => {
      const field = 'price';

      expect(Selectors.requestSort({ field })).to.eql({ field, order: undefined });
    });
  });

  describe('sort()', () => {
    it('should select the active sort from state', () => {
      const sort = { a: 'b' };
      const state: any = { data: { present: { sorts: { items: [{}, sort, {}], selected: 1 } } } };

      expect(Selectors.sort(state)).to.eq(sort);
    });
  });

  describe('navigation()', () => {
    it('should select a navigation from the state', () => {
      const id = 'my navigation';
      const navigation = { a: 'b' };
      const state: any = { data: { present: { navigations: { byId: { [id]: navigation } } } } };

      expect(Selectors.navigation(state, id)).to.eq(navigation);
    });
  });

  describe('skip()', () => {
    it('should select the record skip from the state', () => {
      const state: any = { data: { present: { page: { current: 4 } } } };

      expect(Selectors.skip(state, 12)).to.eq(36);
    });
  });

  describe('products()', () => {
    it('should select the products from the state', () => {
      const products = ['a', 'b', 'd'];
      const state: any = { data: { present: { products } } };

      expect(Selectors.products(state)).to.eq(products);
    });
  });

  describe('recordCount()', () => {
    it('should select the record count', () => {
      const recordCount = 18;
      const state: any = { data: { present: { recordCount } } };

      expect(Selectors.recordCount(state)).to.eq(recordCount);
    });
  });

  describe('details()', () => {
    it('should select the details section from the state', () => {
      const details = { a: 'b' };
      const state: any = { data: { present: { details } } };

      expect(Selectors.details(state)).to.eq(details);
    });
  });

  describe('isRefinementDeselected()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return false if refinement is selected already', () => {
      const navigation = { selected: [4] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return true if refinement is not selected already', () => {
      const navigation = { selected: [8, 3] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementDeselected(<any>{}, 'my navigation', 4)).to.be.true;
    });
  });

  describe('isRefinementSelected()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return false if refinement is deselected already', () => {
      const navigation = { selected: [8, 3] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.not.be.ok;
    });

    it('should return true if refinement is selected already', () => {
      const navigation = { selected: [4] };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.isRefinementSelected(<any>{}, 'my navigation', 4)).to.be.true;
    });
  });

  describe('hasMoreRefinements()', () => {
    it('should return false if navigation does not exist', () => {
      const navigation = stub(Selectors, 'navigation');

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.not.be.ok;
    });

    it('should return false if navigation has no more refinements', () => {
      const navigationStub = stub(Selectors, 'navigation').returns({});

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.not.be.ok;
    });

    it('should return true if navigation has more refinements', () => {
      const navigation = { more: true };
      const navigationStub = stub(Selectors, 'navigation').returns(navigation);

      expect(Selectors.hasMoreRefinements(<any>{}, 'my navigation')).to.be.true;
    });
  });

  describe('area()', () => {
    it('should return the active area', () => {
      const area = 'myArea';

      expect(Selectors.area(<any>{ data: { present: { area } } })).to.eq(area);
    });
  });

  describe('fields()', () => {
    it('should return the whitelisted fields', () => {
      const fields = ['a', 'b'];

      expect(Selectors.fields(<any>{ data: { present: { fields } } })).to.eq(fields);
    });
  });

  describe('query()', () => {
    it('should return the current query', () => {
      const query = 'pineapple';

      expect(Selectors.query(<any>{ data: { present: { query: { original: query } } } })).to.eq(query);
    });
  });

  describe('collections()', () => {
    it('should return indexed collections data', () => {
      const collections = { a: 'b' };

      expect(Selectors.collections(<any>{ data: { present: { collections } } })).to.eq(collections);
    });
  });

  describe('collection()', () => {
    it('should return the active collection', () => {
      const collection = 'myCollection';
      const state: any = { a: 'b' };
      const collectionsSelector = stub(Selectors, 'collections').returns({ selected: collection });

      expect(Selectors.collection(state)).to.eq(collection);
      expect(collectionsSelector).to.be.calledWith(state);
    });
  });

  describe('collectionIndex()', () => {
    it('should return the index of the active collection', () => {
      const state: any = { a: 'b' };
      const collectionsSelector = stub(Selectors, 'collections').returns({ allIds: ['a', 'b', 'c'] });

      expect(Selectors.collectionIndex(state, 'b')).to.eq(1);
      expect(collectionsSelector).to.be.calledWith(state);
    });
  });

  describe('pageSizes()', () => {
    it('should return indexed page size data', () => {
      const pageSizes = { a: 'b' };

      expect(Selectors.pageSizes(<any>{ data: { present: { page: { sizes: pageSizes } } } })).to.eq(pageSizes);
    });
  });

  describe('pageSize()', () => {
    it('should return the currently selected page', () => {
      const state: any = { a: 'b' };
      const pageSizes = { items: ['c', 'd', 'e'], selected: 1 };
      const pageSizesSelector = stub(Selectors, 'pageSizes').returns(pageSizes);

      expect(Selectors.pageSize(state)).to.eq('d');
      expect(pageSizesSelector).to.be.calledWith(state);
    });
  });

  describe('pageSizeIndex()', () => {
    it('should return selected page size index', () => {
      const selected = 4;
      const state: any = { a: 'b' };
      const pageSizes = { selected };
      const pageSizesSelector = stub(Selectors, 'pageSizes').returns(pageSizes);

      expect(Selectors.pageSizeIndex(state)).to.eq(selected);
      expect(pageSizesSelector).to.be.calledWith(state);
    });
  });

  describe('page()', () => {
    it('should return indexed page size data', () => {
      const page = 7;

      expect(Selectors.page(<any>{ data: { present: { page: { current: page } } } })).to.eq(page);
    });
  });

  describe('requestSort()', () => {
    it('should return a descending sort', () => {
      const field = 'height';

      expect(Selectors.requestSort({ field, descending: true })).to.eql({ field, order: 'Descending' });
    });

    it('should return an ascending sort', () => {
      const field = 'height';

      expect(Selectors.requestSort({ field })).to.eql({ field, order: undefined });
    });
  });

  describe('sorts()', () => {
    it('should return indexed sort data', () => {
      const sorts = { a: 'b' };

      expect(Selectors.sorts(<any>{ data: { present: { sorts } } })).to.eq(sorts);
    });
  });

  describe('sort()', () => {
    it('should return the currently selected sort', () => {
      const state: any = { a: 'b' };
      const sorts = { items: ['c', 'd', 'e'], selected: 1 };
      const sortSelector = stub(Selectors, 'sorts').returns(sorts);

      expect(Selectors.sort(state)).to.eq('d');
      expect(sortSelector).to.be.calledWith(state);
    });
  });

  describe('sortIndex()', () => {
    it('should return selected sort index', () => {
      const selected = 4;
      const state: any = { a: 'b' };
      const sorts = { selected };
      const sortsSelector = stub(Selectors, 'sorts').returns(sorts);

      expect(Selectors.sortIndex(state)).to.eq(selected);
      expect(sortsSelector).to.be.calledWith(state);
    });
  });

  describe('skip()', () => {
    it('should return number of skipped records', () => {
      const state: any = { a: 'b' };
      const pageSelector = stub(Selectors, 'page').returns(4);

      expect(Selectors.skip(state, 23)).to.eq(69);
    });
  });

  describe('products()', () => {
    it('should return all products', () => {
      const products = { a: 'b' };

      expect(Selectors.products(<any>{ data: { present: { products } } })).to.eq(products);
    });
  });

  describe('details()', () => {
    it('should return all details data', () => {
      const details = { a: 'b' };

      expect(Selectors.details(<any>{ data: { present: { details } } })).to.eq(details);
    });
  });

  describe('navigations()', () => {
    it('should return indexed navigations data', () => {
      const navigations = { allIds: ['a', 'b', 'c'] };
      const state: any = { data: { present: { navigations } } };
      const navigationSelector = stub(Selectors, 'navigation').returns('x');

      expect(Selectors.navigations(state)).to.eql(['x', 'x', 'x']);
      expect(navigationSelector).to.be.calledThrice
        .and.calledWith(state, 'a')
        .and.calledWith(state, 'b')
        .and.calledWith(state, 'c');
    });
  });

  describe('recordCount()', () => {
    it('should return the current number of products returned by the latest search', () => {
      const recordCount = 77;

      expect(Selectors.recordCount(<any>{ data: { present: { recordCount } } })).to.eq(recordCount);
    });
  });

  describe('autocomplete()', () => {
    it('should return the autocomplete data', () => {
      const autocomplete = { a: 'b' };

      expect(Selectors.autocomplete(<any>{ data: { present: { autocomplete } } })).to.eq(autocomplete);
    });
  });

  describe('autocompleteQuery()', () => {
    it('should return the current autocomplete query', () => {
      const query = 'blanket';
      const state: any = { a: 'b' };
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ query });

      expect(Selectors.autocompleteQuery(state)).to.eq(query);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteCategoryField()', () => {
    it('should return the autocomplete category field', () => {
      const field = 'author';
      const state: any = { a: 'b' };
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ category: { field } });

      expect(Selectors.autocompleteCategoryField(state)).to.eq(field);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteCategoryValues()', () => {
    it('should return the current autocomplete category values', () => {
      const state: any = { a: 'b' };
      const values = ['c', 'd'];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ category: { values } });

      expect(Selectors.autocompleteCategoryValues(state)).to.eq(values);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteSuggestions()', () => {
    it('should return the current autocomplete suggestions', () => {
      const state: any = { a: 'b' };
      const suggestions = ['c', 'd'];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ suggestions });

      expect(Selectors.autocompleteSuggestions(state)).to.eq(suggestions);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });

  describe('autocompleteNavigations()', () => {
    it('should return the current autocomplete navigations', () => {
      const state: any = { a: 'b' };
      const navigations = ['c', 'd'];
      const autocompleteSelector = stub(Selectors, 'autocomplete').returns({ navigations });

      expect(Selectors.autocompleteNavigations(state)).to.eq(navigations);
      expect(autocompleteSelector).to.be.calledWith(state);
    });
  });
});
