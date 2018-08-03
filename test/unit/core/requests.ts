import { Request } from 'groupby-api';
import * as sinon from 'sinon';
import Autocomplete from '../../../src/core/adapters/autocomplete';
import ConfigAdapter from '../../../src/core/adapters/configuration';
import PastPurchaseAdapter from '../../../src/core/adapters/pastPurchases';
import PersonalizationAdapter from '../../../src/core/adapters/personalization';
import SearchAdapter, { MAX_RECORDS } from '../../../src/core/adapters/search';
import Requests from '../../../src/core/requests';
import Selectors from '../../../src/core/selectors';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite('requests', ({ expect, stub, spy }) => {
  describe('override', () => {
    // tslint:disable-next-line max-line-length
    it('should return a function that that calls the given override function with the given request and pastRequest key', () => {
      const overrideConfig = spy();
      const req: any = { a: 'b' };
      const pastReq: any = 'search';

      Requests.override(overrideConfig, pastReq)(req);

      expect(overrideConfig).to.be.calledWithExactly(req, Requests.pastReqs[pastReq]);
    });
  });

  describe('setPastState()', () => {
    it('should return a function that sets the pastReq to the given request', () => {
      const pastReq = 'search';
      const req = { a: 'b' };

      const r = Requests.setPastState(pastReq)(req);

      expect(r).to.eq(req);
      expect(Requests.pastReqs[pastReq]).to.eq(req);
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
      stub(Selectors, 'config').returns({ search: {} });

      const { pageSize, skip } = Requests.search(<any>{});

      expect(pageSize).to.eq(remainingRecords);
      expect(skip).to.eq(originalSkip);
    });

    it('should include language when truthy', () => {
      const language = 'en';
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);
      stub(Selectors, 'config').returns({ search: {} });

      const request = Requests.search(<any>{});

      expect(request.language).to.eq(language);
    });

    it('should include sort when truthy', () => {
      const sort = { a: 'b' };
      sortSelector.returns(true);
      requestSortAdapter.returns(sort);
      stub(Selectors, 'config').returns({ search: {} });

      const request = Requests.search(<any>{});

      expect(request.sort).to.eq(sort);
    });

    it('should add past purchase biasing', () => {
      const biasing = { c: 'd' };
      const state: any = { e: 'f' };
      const config: any = { search: {} };
      const pastPurchaseBiasing = stub(PastPurchaseAdapter, 'pastPurchaseBiasing').returns(biasing);
      pastPurchaseBiasingAdapter.returns(true);
      stub(Selectors, 'config').returns(config);

      const request = Requests.search(state);

      expect(request.biasing).to.eq(biasing);
      expect(pastPurchaseBiasing).to.be.calledWithExactly(state);
    });

    it('should apply defaults', () => {
      const defaults = { a: 'b', c: 'd' };
      stub(Selectors, 'config').returns({ search: { defaults } });

      const request: any = Requests.search(<any>{});

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d');
    });

    it('should apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };
      stub(Selectors, 'config').returns({ search: { overrides } });

      const request = Requests.search(<any>{});

      expect(request.pageSize).to.eq(pageSize);
      expect(request.skip).to.eq(skip);
    });

    it('should not apply overrides', () => {
      const pageSize = 32;
      const skip = 22;
      const overrides = { pageSize, skip };
      stub(Selectors, 'config').returns({ search: { overrides } });

      const request = Requests.search(<any>{}, false);

      expect(request.pageSize).to.eq(remainingRecords);
      expect(request.skip).to.eq(originalSkip);
    });

    it('should override defaults and set past state', () => {
      const defaults = { a: 'b', c: 'd' };
      const overrides = { c: 'd1' };
      stub(Selectors, 'config').returns({ search: { defaults, overrides } });

      const request: any = Requests.search(<any>{});

      expect(request.a).to.eq('b');
      expect(request.c).to.eq('d1');
      expect(Requests.pastReqs.search).to.eq(request);
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
      const numSearchTerms = 31;
      const numNavigations = 3;
      const sortAlphabetically = true;
      const fuzzyMatch = false;
      const normalized = { e: 'f' };
      const defaults = { a: 'b' };
      const overrides = { c: 'd' };
      const overrideFn = () => null;
      const setPastStateFn = () => null;
      const config: any = { g: 'h' };
      const chained = { e: 'f' };
      const chain = stub(Requests, 'chain').returns(chained);
      const normalizer = stub(utils, 'normalizeToFunction').returns(normalized);
      const override = stub(Requests, 'override').returns(overrideFn);
      const setPastState = stub(Requests, 'setPastState').returns(setPastStateFn);
      stub(ConfigAdapter, 'autocompleteSuggestionsDefaults').withArgs(config).returns(defaults);
      stub(ConfigAdapter, 'autocompleteSuggestionsOverrides').withArgs(config).returns(overrides);
      stub(Autocomplete, 'extractLanguage').withArgs(config).returns(language);
      stub(ConfigAdapter, 'extractAutocompleteSuggestionCount').withArgs(config).returns(numSearchTerms);
      stub(ConfigAdapter, 'extractAutocompleteNavigationCount').withArgs(config).returns(numNavigations);
      stub(ConfigAdapter, 'isAutocompleteAlphabeticallySorted').withArgs(config).returns(sortAlphabetically);
      stub(ConfigAdapter, 'isAutocompleteMatchingFuzzily').withArgs(config).returns(fuzzyMatch);

      const request = Requests.autocompleteSuggestions(config);

      expect(request).to.eql(chained);
      expect(normalizer).to.be.calledWithExactly({
        language, numSearchTerms, numNavigations, sortAlphabetically, fuzzyMatch
      });
      expect(override).to.be.calledWithExactly(overrides, 'autocompleteSuggestions');
      expect(setPastState).to.be.calledWithExactly('autocompleteSuggestions');
      expect(chain).to.be.calledWithExactly(defaults, normalized, overrideFn, setPastStateFn);
    });
  });

  describe('autocompleteProducts()', () => {
    let chain;
    let config: any = {
      personalization: {
        realTimeBiasing: {
          autocomplete: false
        }
      }
    };
    const state: any = { a: 'b' };
    const area = 'myArea';
    const language = 'en';
    const pageSize = 41;
    const defaults = { c: 'd' };
    const overrides = { e: 'f' };
    const searchReq = { g: 'h' };
    const chained = { i: 'j' };
    const buildingReq = {
      ...searchReq,
      refinements: [],
      skip: 0,
      sort: undefined,
      language,
      area,
      pageSize
    };
    const normalizedRequest = () => null;
    const overrideFn = () => null;
    const setPastState = () => null;

    beforeEach(() => {
      chain = stub(Requests, 'chain');
      stub(Selectors, 'config').withArgs(state).returns(config);
      stub(Requests, 'search').withArgs(state, false).returns(searchReq);
      stub(Autocomplete, 'extractProductLanguage').withArgs(config).returns(language);
      stub(Autocomplete, 'extractProductArea').withArgs(config).returns(area);
      stub(ConfigAdapter, 'extractAutocompleteProductCount').withArgs(config).returns(pageSize);
      stub(ConfigAdapter, 'autocompleteProductsDefaults').withArgs(config).returns(defaults);
      stub(ConfigAdapter, 'autocompleteProductsOverrides').withArgs(config).returns(overrides);
      stub(Requests, 'override').withArgs(overrides, 'autocompleteProducts').returns(overrideFn);
      stub(Requests, 'setPastState').withArgs('autocompleteProducts').returns(setPastState);
    });

    it('should create a products request', () => {
      stub(utils, 'normalizeToFunction').withArgs(buildingReq).returns(normalizedRequest);

      Requests.autocompleteProducts(state);

      expect(chain).to.be.calledWithExactly(defaults, normalizedRequest, overrideFn, setPastState);
    });

    it('should create a products request with realTimeBiasing bias', () => {
      const realTimeBiasBuiltReq = { a: 'b' };
      config.personalization.realTimeBiasing.autocomplete = true;
      stub(Requests, 'realTimeBiasing').withArgs(state, buildingReq).returns(realTimeBiasBuiltReq);
      stub(utils, 'normalizeToFunction').withArgs(realTimeBiasBuiltReq).returns(normalizedRequest);

      Requests.autocompleteProducts(state);

      expect(chain).to.be.calledWithExactly(defaults, normalizedRequest, overrideFn, setPastState);
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
    it('should apply transformations', () => {
      expect(Requests.chain(
        utils.normalizeToFunction(<any>{ a: 'b' }),
        (x) => ({ ...x, c: 'd' }),
        utils.normalizeToFunction({ e: 'f' })
      )).to.eql({ a: 'b', c: 'd', e: 'f' });
    });

    it('should merge source if tranformation returned falsey', () => {
      expect(Requests.chain(
        utils.normalizeToFunction(<any>{ a: 'b' }),
        (x) => null,
        utils.normalizeToFunction({ e: 'f' })
      )).to.eql({ a: 'b', e: 'f' });
    });
  });
});
