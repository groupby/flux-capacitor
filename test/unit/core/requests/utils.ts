import { Request } from 'groupby-api';
import * as sinon from 'sinon';
import Autocomplete from '../../../../src/core/adapters/autocomplete';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import PastPurchaseAdapter from '../../../../src/core/adapters/past-purchases';
import PersonalizationAdapter from '../../../../src/core/adapters/personalization';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import SearchAdapter, { MAX_RECORDS } from '../../../../src/core/adapters/search';
import RequestHelpers from '../../../../src/core/requests/utils';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('requests helpers', ({ expect, stub, spy }) => {
  describe('buildPostBody()', () => {
    it('should build the body', () => {
      const body: any = { a: 1 };

      expect(RequestHelpers.buildPostBody(body)).to.eql({
        method: 'POST',
        body: JSON.stringify(body),
      });
    });
  });

  describe('search()', () => {
    const remainingRecords = 2;
    const originalPageSize = MAX_RECORDS - 1;
    const originalSkip = MAX_RECORDS - remainingRecords;
    const area = 'ok';
    const fields = 'fields';
    const query = 'dress';
    const collection = 'alternate';
    const refinements = [{ a: 'b' }, { c: 'd' }];
    let sortSelector: sinon.SinonStub;
    let requestSortAdapter: sinon.SinonStub;
    let pastPurchaseBiasingAdapter: sinon.SinonStub;

    beforeEach(() => {
      sortSelector = stub(Selectors, 'sort');
      requestSortAdapter = stub(SearchAdapter, 'requestSort');
      pastPurchaseBiasingAdapter = stub(ConfigAdapter, 'shouldAddPastPurchaseBias');
      stub(Selectors, 'area').returns(area);
      stub(Selectors, 'fields').returns(fields);
      stub(Selectors, 'query').returns(query);
      stub(Selectors, 'collection').returns(collection);
      stub(Selectors, 'selectedRefinements').returns(refinements);
      stub(Selectors, 'pageSize').returns(originalPageSize);
      stub(Selectors, 'skip').returns(originalSkip);
    });

    it('should build out request', () => {
      stub(Selectors, 'config').returns({});

      expect(RequestHelpers.search(<any>{})).to.eql({
        pageSize: remainingRecords,
        area,
        fields,
        query,
        collection,
        refinements,
        skip: originalSkip
      });
    });

    it('should decrease page size to prevent exceeding MAX_RECORDS', () => {
      stub(Selectors, 'config').returns({ search: {} });

      const { pageSize, skip } = RequestHelpers.search(<any>{});

      expect(pageSize).to.eq(remainingRecords);
      expect(skip).to.eq(originalSkip);
    });

    it('should include language when truthy', () => {
      const language = 'en';
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);
      stub(Selectors, 'config').returns({ search: {} });

      const request = RequestHelpers.search(<any>{});

      expect(request.language).to.eq(language);
    });

    it('should include sort when truthy', () => {
      const sort = { a: 'b' };
      sortSelector.returns(true);
      requestSortAdapter.returns(sort);
      stub(Selectors, 'config').returns({ search: {} });

      const request = RequestHelpers.search(<any>{});

      expect(request.sort).to.eq(sort);
    });

    it('should add past purchase biasing', () => {
      const biasing = { c: 'd' };
      const state: any = { e: 'f' };
      const config: any = { search: {} };
      const pastPurchaseBiasing = stub(PastPurchaseAdapter, 'pastPurchaseBiasing').returns(biasing);
      pastPurchaseBiasingAdapter.returns(true);
      stub(Selectors, 'config').returns(config);

      const request = RequestHelpers.search(state);

      expect(request.biasing).to.eq(biasing);
      expect(pastPurchaseBiasing).to.be.calledWithExactly(state);
    });

    it('should apply overrideRequest', () => {
      const pageSize = 32;
      const skip = 22;
      const overrideRequest = { pageSize, skip };
      stub(Selectors, 'config').returns({});

      const request = RequestHelpers.search(<any>{}, overrideRequest);

      expect(request.pageSize).to.eq(pageSize);
      expect(request.skip).to.eq(skip);
    });
  });

  describe('pastPurchaseProducts', () => {
    const searchRequest: Request = <any>{};
    const pageSize = 5;
    const page = 2;
    const query = 'hat';
    const refinements = ['a', 'b', 'c'];
    const skip = pageSize * (page - 1);
    const state: any = { a: 1 };

    beforeEach(() => {
      stub(RequestHelpers, 'search').returns(searchRequest);
      stub(Selectors, 'pastPurchasePageSize').returns(pageSize);
      stub(Selectors, 'pastPurchaseQuery').returns(query);
      stub(Selectors, 'pastPurchaseSelectedRefinements').returns(refinements);
      stub(Selectors, 'pastPurchasePage').returns(page);
    });

    it('should spread the search request', () => {
      const req = RequestHelpers.pastPurchaseProducts(state);

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

      const req = RequestHelpers.pastPurchaseProducts(state);

      expect(req.pageSize).to.eql(pageSize);
      expect(req.query).to.eql(query);
      expect(req.refinements).to.eql(refinements);
      expect(req.skip).to.eql(skip);
    });

    it('should apply overrideRequest', () => {
      const overrideRequest: any = {
        pageSize: 1000000,
        query: 'hmm ok',
        refinements: [{ a: 'b' }],
        skip: 234,
        sort: { c: 'd' },
        extra: 'extra override',
      };

      const req: any = RequestHelpers.pastPurchaseProducts(state, overrideRequest);

      expect(req.pageSize).to.eq(overrideRequest.pageSize);
      expect(req.query).to.eq(overrideRequest.query);
      expect(req.refinements).to.eq(overrideRequest.refinements);
      expect(req.skip).to.eq(overrideRequest.skip);
      expect(req.sort).to.eq(overrideRequest.sort);
      expect(req.extra).to.eq(overrideRequest.extra);
    });
  });

  describe('recommendationsSuggestions()', () => {
    const query = 'dresses';
    const state: any = { a: 'b' };
    const size = 20;
    const request = { x: 'y' };

    beforeEach(() => {
      stub(Selectors, 'config')
        .withArgs(state)
        .returns({ autocomplete: { recommendations: { suggestionCount: size } } });
    });

    it('should build request, using query from overrideRequest', () => {
      stub(RecommendationsAdapter, 'addLocationToRequest')
        .withArgs({ size, matchPartial: { and: [{ search: { query } }] } }, state)
        .returns(request);

      const req = RequestHelpers.recommendationsSuggestions(state, { query });

      expect(req).to.eql(request);
    });

    it('should build request, using query from the query selector', () => {
      const otherQuery = 'hats';
      stub(Selectors, 'query').withArgs(state).returns(otherQuery);
      stub(RecommendationsAdapter, 'addLocationToRequest')
        .withArgs({ size, matchPartial: { and: [{ search: { query: otherQuery } }] } }, state)
        .returns(request);

      const req = RequestHelpers.recommendationsSuggestions(state);

      expect(req).to.eql(request);
    });

    it('should apply overrideRequest', () => {
      const overrideRequest = {
        query,
        a: { c: 'd' },
      };
      const { query: q, ...result } = overrideRequest;
      stub(RecommendationsAdapter, 'addLocationToRequest')
        .withArgs({ size, matchPartial: { and: [{ search: { query } }] } }, state)
        .returns(request);

      const req = RequestHelpers.recommendationsSuggestions(state, overrideRequest);

      expect(req).to.eql({ ...request, ...result });
    });
  });

  describe('recommendationsNavigations', () => {
    const state: any = { a: 'b' };
    const query = 'shoes';
    const minSize = 10;
    const size = 231;
    const window = 'day';
    const sizeAndWindow = { size, window };

    beforeEach(() => {
      stub(Selectors, 'query').withArgs(state).returns(query);
    });

    it('should build request using iNav minSize', () => {
      const config = { recommendations: { iNav: { minSize, size, window } } };
      const request = {
        minSize,
        sequence: [
          {
            ...sizeAndWindow,
            matchPartial: {
              and: [{ search: { query } }]
            },
          },
          sizeAndWindow,
        ]
      };
      stub(Selectors, 'config').withArgs(state).returns(config);

      const req = RequestHelpers.recommendationsNavigations(state);

      expect(req).to.eql(request);
    });

    it('should build request using iNav size as minSize', () => {
      const config = { recommendations: { iNav: { size, window } } };
      const request = {
        minSize: size,
        sequence: [
          {
            ...sizeAndWindow,
            matchPartial: {
              and: [{ search: { query } }]
            },
          },
          sizeAndWindow,
        ]
      };
      stub(Selectors, 'config').withArgs(state).returns(config);

      const req = RequestHelpers.recommendationsNavigations(state);

      expect(req).to.eql(request);
    });

    it('should apply overrideRequest', () => {
      const config = { recommendations: { iNav: { size, window } } };
      const overrideRequest: any = {
        minSize: 100,
        sequence: [{ a: 'b' }, { c: 'd' }],
        extra: 'extra override'
      };
      stub(Selectors, 'config').withArgs(state).returns(config);

      const req = RequestHelpers.recommendationsNavigations(state, overrideRequest);

      expect(req).to.eql(overrideRequest);
    });
  });

  describe('recommendationsProductIDs()', () => {
    const state: any = { a: 'b' };
    const size = 23;
    const idField = 'id';
    const config = {
      recommendations: {
        productSuggestions: {
          productCount: size
        },
        idField
      }
    };
    const request = { x: 'y' };

    beforeEach(() => {
      stub(Selectors, 'config').withArgs(state).returns(config);
      stub(RecommendationsAdapter, 'addLocationToRequest')
        .withArgs({ size, type: 'viewProduct', target: idField }, state)
        .returns(request);
    });

    it('should build request', () => {
      expect(RequestHelpers.recommendationsProductIDs(state)).to.eql(request);
    });

    it('should apply overrideRequest', () => {
      const overrideRequest: any = { x: 'b', c: 'd' };

      expect(RequestHelpers.recommendationsProductIDs(state, overrideRequest)).to.eql(overrideRequest);
    });
  });

  describe('autocompleteSuggestions()', () => {
    const area = 'myArea';
    const language = 'en';
    const numSearchTerms = 31;
    const numNavigations = 3;
    const sortAlphabetically = true;
    const fuzzyMatch = false;
    const config: any = { g: 'h' };
    const state: any = { a: 'b' };
    const request = {
      language,
      numSearchTerms,
      numNavigations,
      sortAlphabetically,
      fuzzyMatch
    };

    beforeEach(() => {
      stub(Selectors, 'config').withArgs(state).returns(config);
      stub(Autocomplete, 'extractLanguage').withArgs(config).returns(language);
      stub(ConfigAdapter, 'extractAutocompleteSuggestionCount').withArgs(config).returns(numSearchTerms);
      stub(ConfigAdapter, 'extractAutocompleteNavigationCount').withArgs(config).returns(numNavigations);
      stub(ConfigAdapter, 'isAutocompleteAlphabeticallySorted').withArgs(config).returns(sortAlphabetically);
      stub(ConfigAdapter, 'isAutocompleteMatchingFuzzily').withArgs(config).returns(fuzzyMatch);
    });

    it('should create a suggestions request', () => {
      expect(RequestHelpers.autocompleteSuggestions(state)).to.eql(request);
    });

    it('should apply overrideRequest', () => {
      const overrideRequest = {
        language: 'fr',
        numSearchTerms: 100,
        numNavigations: 30,
        sortAlphabetically: false,
        fuzzyMatch: true,
        extra: 'extra override'
      };

      expect(RequestHelpers.autocompleteSuggestions(state, overrideRequest)).to.eql(overrideRequest);
    });
  });

  describe('autocompleteProducts()', () => {
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
    const overrides = { e: 'f' };
    const searchReq = { g: 'h' };

    beforeEach(() => {
      stub(Selectors, 'config').withArgs(state).returns(config);
      stub(RequestHelpers, 'search').withArgs(state, {
        refinements: [],
        skip: 0,
        sort: undefined,
        language,
        area,
        pageSize
      }).returns(searchReq);
      stub(Autocomplete, 'extractProductLanguage').withArgs(config).returns(language);
      stub(Autocomplete, 'extractProductArea').withArgs(config).returns(area);
      stub(ConfigAdapter, 'extractAutocompleteProductCount').withArgs(config).returns(pageSize);
      stub(ConfigAdapter, 'autocompleteProductsOverrides').withArgs(config).returns(overrides);
    });

    it('should create a products request', () => {
      expect(RequestHelpers.autocompleteProducts(state)).to.eql(searchReq);
    });

    it('should create a products request with realTimeBiasing bias', () => {
      const realTimeBiasBuiltReq = { a: 'b' };
      config.personalization.realTimeBiasing.autocomplete = true;
      stub(RequestHelpers, 'realTimeBiasing').withArgs(state, searchReq).returns(realTimeBiasBuiltReq);

      expect(RequestHelpers.autocompleteProducts(state)).to.eql(realTimeBiasBuiltReq);
    });

    it('should apply overrideRequest', () => {
      stub(RequestHelpers, 'realTimeBiasing');
      const overrideRequest: any = {
        g: 'y',
        extra: 'extra override'
      };

      expect(RequestHelpers.autocompleteProducts(state, overrideRequest)).to.eql(overrideRequest);
    });
  });

  describe('products()', () => {
    const state: any = { a: 'b' };
    const searchRequest = { c: 'd' };
    const request = { e: 'f' };

    beforeEach(() => {
      stub(RequestHelpers, 'search').withArgs(state).returns(searchRequest);
      stub(RequestHelpers, 'realTimeBiasing').withArgs(state, searchRequest).returns(request);
    });

    it('should build request', () => {
      expect(RequestHelpers.products(state)).to.eql(request);
    });

    it('should apply overrideRequest', () => {
      const overrideRequest: any = { g: 'h' };

      expect(RequestHelpers.products(state, overrideRequest)).to.eql({ ...request, ...overrideRequest });
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

      const result = RequestHelpers.realTimeBiasing(state, request);

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

      const result = RequestHelpers.realTimeBiasing(state, request);

      expect(convertBiasToSearch).to.be.calledWithExactly(state, request.refinements);
      expect(result).to.eql(requestWithRTB);
    });
  });

  describe('chain()', () => {
    it('should apply transformations', () => {
      expect(RequestHelpers.chain(
        utils.normalizeToFunction(<any>{ a: 'b' }),
        (x) => ({ ...x, c: 'd' }),
        utils.normalizeToFunction({ e: 'f' })
      )).to.eql({ a: 'b', c: 'd', e: 'f' });
    });

    it('should merge source if tranformation returned falsey', () => {
      expect(RequestHelpers.chain(
        utils.normalizeToFunction(<any>{ a: 'b' }),
        (x) => null,
        utils.normalizeToFunction({ e: 'f' })
      )).to.eql({ a: 'b', e: 'f' });
    });
  });
});
