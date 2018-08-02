import { Request } from 'groupby-api';
import * as sinon from 'sinon';
import ConfigAdapter from '../../../src/core/adapters/configuration';
import PastPurchaseAdapter from '../../../src/core/adapters/pastPurchases';
import PersonalizationAdapter from '../../../src/core/adapters/personalization';
import SearchAdapter, { MAX_RECORDS } from '../../../src/core/adapters/search';
import Requests from '../../../src/core/requests';
import Selectors from '../../../src/core/selectors';
import suite from '../_suite';

suite('requests', ({ expect, stub, spy }) => {

  describe('override', () => {
    it('should call override function and update past request', () => {
      const finalReq = { c: 'd' };
      const overrideConfig = () => ({});
      const req: any = { a: 'b' };
      const pastReq: any = 'search';
      const pastSearchReq = Requests.pastReqs.search;
      const chain = stub(Requests, 'chain').returns(finalReq);

      const result = Requests.override(overrideConfig, req, pastReq);

      expect(result).to.eql(finalReq);
      expect(chain).to.be.calledWith(req, overrideConfig);
      expect(Requests.pastReqs.search).to.eql(finalReq);
    });
  });

  describe('search()', () => {
    const remainingRecords = 2;
    const originalPageSize = MAX_RECORDS - 1;
    const originalSkip = MAX_RECORDS - remainingRecords;
    let sortSelector: sinon.SinonStub;
    let requestSortAdapter: sinon.SinonStub;
    let pastPurchaseBiasingAdapter: sinon.SinonStub;

    beforeEach(() => {
      sortSelector = stub(Selectors, 'sort');
      requestSortAdapter = stub(SearchAdapter, 'requestSort');
      pastPurchaseBiasingAdapter = stub(ConfigAdapter, 'shouldAddPastPurchaseBias');
      stub(Selectors, 'area');
      stub(Selectors, 'fields');
      stub(Selectors, 'query');
      stub(Selectors, 'collection');
      stub(Selectors, 'selectedRefinements');
      stub(Selectors, 'pageSize').returns(originalPageSize);
      stub(Selectors, 'skip').returns(originalSkip);
    });

    it('should decrease page size to prevent exceeding MAX_RECORDS', () => {
      stub(Selectors,'config').returns({ search: {} });

      const { pageSize, skip } = Requests.search(<any>{});

      expect(pageSize).to.eq(remainingRecords);
      expect(skip).to.eq(originalSkip);
    });

    it('should include language when truthy', () => {
      const language = 'en';
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);
      stub(Selectors,'config').returns({ search: {} });

      const request = Requests.search(<any>{});

      expect(request.language).to.eq(language);
    });

    it('should include sort when truthy', () => {
      const sort = { a: 'b' };
      sortSelector.returns(true);
      requestSortAdapter.returns(sort);
      stub(Selectors,'config').returns({ search: {} });

      const request = Requests.search(<any>{});

      expect(request.sort).to.eq(sort);
    });

    it('should add past purchase biasing', () => {
      const biasing = { c: 'd' };
      const state: any = { e: 'f' };
      const config: any = { search: {} };
      const pastPurchaseBiasing = stub(PastPurchaseAdapter, 'pastPurchaseBiasing').returns(biasing);
      pastPurchaseBiasingAdapter.returns(true);
      stub(Selectors,'config').returns(config);

      const request = Requests.search(state);

      expect(request.biasing).to.eq(biasing);
      expect(pastPurchaseBiasing).to.be.calledWithExactly(state);
    });

    it('should apply defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      stub(Selectors,'config').returns({ search: { defaults } });

      const request: any = Requests.search(<any>{});

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d');
    });

    it('should apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };
      stub(Selectors,'config').returns({ search: { overrides } });

      const request = Requests.search(<any>{});

      expect(request.pageSize).to.eq(pageSize);
      expect(request.skip).to.eq(skip);
    });

    it('should not apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };
      stub(Selectors,'config').returns({ search: { overrides } });

      const request = Requests.search(<any>{}, false);

      expect(request.pageSize).to.eq(remainingRecords);
      expect(request.skip).to.eq(originalSkip);
    });

    it('should override defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      const overrides = { c: 'd1' };
      stub(Selectors,'config').returns({ search: { defaults, overrides } });

      const request: any = Requests.search(<any>{});

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
    });
  });

  describe('pastPurchaseProducts', () => {
    const searchRequest: Request = <any>{};
    const pageSize = 5;
    const page = 2;
    const query = 'hat';
    const refinements = ['a', 'b', 'c'];
    const skip = pageSize * (page - 1);
    const state: any = { a : 1 };

    beforeEach(() => {
      stub(Requests, 'search').returns(searchRequest);
      stub(Selectors, 'pastPurchasePageSize').returns(pageSize);
      stub(Selectors, 'pastPurchaseQuery').returns(query);
      stub(Selectors, 'pastPurchaseSelectedRefinements').returns(refinements);
      stub(Selectors, 'pastPurchasePage').returns(page);
    });

    it('should spread the search request', () => {
      const req = Requests.pastPurchaseProducts(state);

      expect(req).to.include(searchRequest);
    });

    it('should overwrite properties of the search', () => {
      searchRequest.pageSize = -3;
      searchRequest.query = 'shirt';
      searchRequest.refinements = [{
        navigationName: 'f',
        type: 'Value',
        value: 'j',
      }, {
        navigationName: 'i',
        exclude: true,
        type: 'Range',
        low: 1,
        high: 3,
      }];
      searchRequest.skip = -4;

      const req = Requests.pastPurchaseProducts(state);

      expect(req.pageSize).to.eql(pageSize);
      expect(req.query).to.eql(query);
      expect(req.refinements).to.eql(refinements);
      expect(req.skip).to.eql(skip);
    });

    it('should not add query and refinements if getNavigations is false', () => {
      searchRequest.pageSize = -3;
      searchRequest.skip = -4;

      const req = Requests.pastPurchaseProducts(state, true);

      expect(req.pageSize).to.eql(pageSize);
      expect(req.query).to.eql('');
      expect(req.refinements).to.eql([]);
      expect(req.skip).to.eql(skip);
    });
  });

  describe('autocompleteSuggestions()', () => {
    it('should create a suggestions request', () => {
      const area = 'myArea';
      const language = 'en';
      const suggestionCount = 31;
      const navigationCount = 3;
      const defaults = { a: 'b' };
      const overrides = { c: 'd' };
      const config: any = {
        autocomplete: {
          area,
          language,
          suggestionCount,
          navigationCount,
          alphabetical: true,
          fuzzy: true,
          defaults: { suggestions: defaults },
          overrides: { suggestions: overrides },
        }
      };
      const chained = { e: 'f' };
      const chain = stub(Requests, 'chain').returns(chained);
      stub(ConfigAdapter, 'autocompleteSuggestionsDefaults').returns(defaults);
      stub(ConfigAdapter, 'autocompleteSuggestionsOverrides').returns(overrides);

      const request = Requests.autocompleteSuggestions(config);

      expect(request).to.eql(chained);
      expect(chain).to.be.calledWithExactly(defaults, {
        language,
        numSearchTerms: suggestionCount,
        numNavigations: navigationCount,
        sortAlphabetically: true,
        fuzzyMatch: true,
      }, overrides);
    });
  });

  describe('autocompleteProducts()', () => {
    it('should create a products request', () => {
      const area = 'myArea';
      const language = 'en';
      const productCount = 41;
      const defaults = { a: 'b' };
      const overrides = { c: 'd' };
      const config: any = {
        autocomplete: {
          area,
          language,
          products: { count: productCount },
          defaults: { products: defaults },
          overrides: { products: overrides },
        },
        personalization: {
          realTimeBiasing: {
            autocomplete: false
          }
        }
      };
      const chained = { e: 'f' };
      const req = { g: 'h' };
      const autocompleteProductsDefaults = { i: 'j' };
      const autocompleteProductsOverrides = { k: 'l' };
      const state: any = {};
      const chain = stub(Requests, 'chain').returns(chained);
      const search = stub(Requests, 'search').returns({ i: 'j' });
      const override = stub(Requests, 'override').returns(req);
      stub(ConfigAdapter, 'autocompleteProductsDefaults').returns(autocompleteProductsDefaults);
      stub(ConfigAdapter, 'autocompleteProductsOverrides').returns(autocompleteProductsOverrides);
      stub(Selectors,'config').returns(config);

      const request = Requests.autocompleteProducts(state);

      expect(request).to.eql(req);
      expect(chain).to.be.calledWith(autocompleteProductsDefaults, {
        i: 'j',
        skip: 0,
        refinements: [],
        sort: undefined,
        area,
        language,
        pageSize: productCount,
      });
      expect(override).to.be.calledWithExactly(autocompleteProductsOverrides, chained, 'autocompleteProducts');
    });

    it('should create a products request with realTimeBiasing bias', () => {
      const area = 'myArea';
      const language = 'en';
      const productCount = 41;
      const defaults = { a: 'b' };
      const overrides = { c: 'd' };
      const config: any = {
        autocomplete: {
          area,
          language,
          products: { count: productCount },
          defaults: { products: defaults },
          overrides: { products: overrides },
        },
        personalization: {
          realTimeBiasing: {
            autocomplete: true
          }
        }
      };
      const chained = { e: 'f' };
      const biasReq = { c: 'd' };
      const req = { g: 'h' };
      const autocompleteProductsDefaults = { i: 'j' };
      const autocompleteProductsOverrides = { k: 'l' };
      const state: any = {};
      const chain = stub(Requests, 'chain').returns(chained);
      const search = stub(Requests, 'search').returns({ i: 'j' });
      const realTimeBiasing = stub(Requests, 'realTimeBiasing').returns(biasReq);
      const override = stub(Requests, 'override').returns(req);
      stub(ConfigAdapter, 'autocompleteProductsDefaults').returns(autocompleteProductsDefaults);
      stub(ConfigAdapter, 'autocompleteProductsOverrides').returns(autocompleteProductsOverrides);
      stub(Selectors,'config').returns(config);

      const request = Requests.autocompleteProducts(state);

      expect(request).to.eql(req);
      expect(realTimeBiasing).to.be.calledOnce;
      expect(chain).to.be.calledWith(autocompleteProductsDefaults, biasReq);
      expect(override).to.be.calledWithExactly(autocompleteProductsOverrides, chained, 'autocompleteProducts');
    });
  });

  describe('realTimeBiasing()', () => {
    it('should mix biases into request', () => {
      const state = <any>{ a: 'b' };
      const request = <any>{ c: 'd', refinements: [] };
      const addedBiases = [{ e: 'f' }, { g: 'h' }];
      const requestWithRTB = {
        ...request,
        biasing: { biases: addedBiases }
      };
      const convertBiasToSearch = stub(PersonalizationAdapter, 'convertBiasToSearch').returns(addedBiases);

      const result = Requests.realTimeBiasing(state, request);

      expect(convertBiasToSearch).to.be.calledWithExactly(state, request.refinements);
      expect(result).to.eql(requestWithRTB);
    });

    it('should include request bias in resulting request', () => {
      const state = <any>{ a: 'b' };
      const reqBiases = [{ i: 'j' }];
      const request = <any>{ c: 'd', refinements: [], biasing: { biases: reqBiases } };
      const addedBiases = [{ e: 'f' }, { g: 'h' }];
      const requestWithRTB = {
        ...request,
        biasing: { biases: [...reqBiases, ...addedBiases] }
      };
      const convertBiasToSearch = stub(PersonalizationAdapter, 'convertBiasToSearch').returns(addedBiases);

      const result = Requests.realTimeBiasing(state, request);

      expect(convertBiasToSearch).to.be.calledWithExactly(state, request.refinements);
      expect(result).to.eql(requestWithRTB);
    });
  });

  describe('chain()', () => {
    it('should apply transformations and merge objects', () => {
      expect(Requests.chain({ a: 'b' }, (x) => ({ ...x, c: 'd' }), <any>{ e: 'f' })).to.eql({ a: 'b', c: 'd', e: 'f' });
    });

    it('should merge source if tranformation returned falsey', () => {
      expect(Requests.chain({ a: 'b' }, (x) => null, <any>{ e: 'f' })).to.eql({ a: 'b', e: 'f' });
    });
  });
});
