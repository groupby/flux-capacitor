import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapter from '../../../../src/core/adapters/autocomplete';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import SearchAdapter from '../../../../src/core/adapters/search';
import * as RequestBuilders from '../../../../src/core/requests';
import RequestHelpers from '../../../../src/core/requests/utils';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/autocomplete';
import Requests from '../../../../src/core/sagas/requests';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('autocomplete saga', ({ expect, spy, stub, sinon }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchSuggestions()', () => {
      it('should return sayt suggestions', () => {
        const query = 'rain boots';
        const field = 'popularity';
        const navigationLabels = { u: 'v' };
        const customerId = 'myCustomer';
        const suggestionCount = 10;
        const location = { minSize: 10 };
        const recommendations = { suggestionCount };
        const config = { a: 'b', customerId, recommendations: { location }, autocomplete: { recommendations } };
        const receiveAutocompleteSuggestionsAction: any = { c: 'd' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = { actions: { receiveAutocompleteSuggestions } };
        const suggestions = { e: 'f', suggestions: {} };
        const request = { g: 'h' };
        const response = { i: 'j' };
        const trendingResponseValue = { o: 'p' };
        const trendingBodyPromise = Promise.resolve();
        const trendingResponse = { json: () => trendingBodyPromise };
        const mergedSuggestions = { m: 'n' };
        const state = { s: 't' };
        const extractSuggestions = stub(Adapter, 'extractSuggestions').returns(suggestions);
        const mergeSuggestions = stub(Adapter, 'mergeSuggestions').returns(mergedSuggestions);
        const extractAutocompleteNavigationLabels = stub(ConfigAdapter, 'extractAutocompleteNavigationLabels')
          .returns(navigationLabels);
        const matchExact = 'match exact';
        const autocompleteRequest = stub(Requests, 'autocomplete').returns(response);
        const recommendationsRequest = stub(Requests, 'recommendations').returns(trendingResponse);
        stub(Selectors, 'autocompleteCategoryField').returns(field);
        stub(RequestBuilders.autocompleteSuggestionsRequest, 'composeRequest').withArgs(state).returns(request);
        stub(RequestBuilders.recommendationsSuggestionsRequest, 'composeRequest')
          .withArgs(state, { query }).returns(matchExact);

        const task = Tasks.fetchSuggestions(flux, <any>{ payload: query });

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value)
          .to.eql(effects.all([
            effects.call(autocompleteRequest, flux, query, request),
            effects.call(recommendationsRequest, {
              customerId,
              endpoint: 'searches',
              mode: 'Popular',
              body: matchExact
            })
          ]));
        expect(task.next([response, trendingResponse]).value).to.eql(trendingBodyPromise);
        expect(task.next(trendingResponseValue).value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(extractAutocompleteNavigationLabels).to.be.calledWithExactly(config);
        expect(extractSuggestions).to.be.calledWithExactly(response, query, field, navigationLabels, config);
        expect(mergeSuggestions).to.be.calledWithExactly(suggestions.suggestions, trendingResponseValue);
        // tslint:disable-next-line max-line-length
        expect(receiveAutocompleteSuggestions).to.be.calledWithExactly({ ...suggestions, suggestions: mergedSuggestions });
        task.next();
      });

      it('should skip trending if suggestionCount is 0', () => {
        const query = 'rain boots';
        const customerId = 'myCustomer';
        const recommendations = { suggestionCount: 0 };
        const location = { minSize: 10 };
        const config = { a: 'b', customerId, recommendations: { location }, autocomplete: { recommendations } };
        const receiveAutocompleteSuggestionsAction: any = { c: 'd' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = { actions: { receiveAutocompleteSuggestions } };
        const suggestions = { e: 'f', suggestions: {} };
        const request = { g: 'h' };
        const response = { i: 'j' };
        const state = { s: 't' };
        const autocompleteRequest = stub(Requests, 'autocomplete').returns(response);
        stub(RequestBuilders.autocompleteSuggestionsRequest, 'composeRequest').withArgs(state).returns(request);
        stub(Selectors, 'config').returns(config);
        stub(Selectors, 'autocompleteCategoryField');
        stub(Adapter, 'extractSuggestions').returns(suggestions);

        const task = Tasks.fetchSuggestions(flux, <any>{ payload: query });

        task.next();
        task.next(state);
        expect(task.next(config).value).to.eql(effects.all([effects.call(autocompleteRequest, flux, query, request)]));
        expect(task.next([response]).value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(receiveAutocompleteSuggestions).to.be.calledWithExactly(suggestions);
        task.next();
      });

      it('should make request against specified endpoint', () => {
        const query = 'rain boots';
        const customerId = 'myCustomer';
        const suggestionCount = 10;
        const location = { minSize: 10 };
        const recommendations = { suggestionCount, suggestionMode: 'trending' };
        const config = { a: 'b', customerId, recommendations: { location }, autocomplete: { recommendations } };
        const flux: any = { actions: { receiveAutocompleteSuggestions: () => null } };
        const request = { g: 'h' };
        const matchExact = 'match exact';
        const autocompleteRequest = stub(Requests, 'autocomplete');
        const recommendationsRequest = stub(Requests, 'recommendations');
        const state = { a: 'b' };
        stub(RequestBuilders.autocompleteSuggestionsRequest, 'composeRequest').withArgs(state).returns(request);
        stub(RequestBuilders.recommendationsSuggestionsRequest, 'composeRequest')
          .withArgs(state, { query }).returns(matchExact);
        stub(Selectors, 'autocompleteCategoryField');

        const task = Tasks.fetchSuggestions(flux, <any>{ payload: query });

        task.next();
        task.next(state);
        expect(task.next(config).value)
          .to.eql(effects.all([
            effects.call(autocompleteRequest, flux, query, request),
            effects.call(recommendationsRequest, {
              customerId,
              endpoint: 'searches',
              mode: 'Trending',
              body: matchExact
            })
          ]));
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveAutocompleteSuggestionsAction: any = { a: 'b' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = {
          actions: { receiveAutocompleteSuggestions }
        };

        const task = Tasks.fetchSuggestions(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(receiveAutocompleteSuggestions).to.be.calledWith(error);
        task.next();
      });
    });

    describe('fetchProducts()', () => {
      it('should return products', () => {
        const query = 'umbrellas';
        const refinements = [{ field: 'brand', value: 'Nike', exclude: true }];
        const action: any = { payload: { query, refinements } };
        const receiveAutocompleteProductsAction: any = { c: 'd' };
        const receiveAutocompleteProducts = spy(() => receiveAutocompleteProductsAction);
        const requestRefinements = { navigationName: 'brand', type: 'Value', value: 'Nike', exclude: true };
        // tslint:disable-next-line:max-line-length
        const overrideRefinements = [requestRefinements, { type: 'Value', navigationName: 'Mill_Name', exclude: true, value: 'Under Armour' }];
        const request = { g: 'h', refinements: { overrideRefinements } };
        const response = { i: 'j' };
        const config: any = { k: 'l' };
        const flux: any = { actions: { receiveAutocompleteProducts } };
        const searchRequest = stub(Requests, 'search').returns(response);
        const state = { a: 'b' };
        const autocompleteProductsRequest = stub(RequestBuilders.autocompleteProductsRequest, 'composeRequest')
          .withArgs(state, { refinements: [requestRefinements], query }).returns(request);
        stub(Selectors, 'config').returns(config);

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call(searchRequest, flux, request));
        expect(task.next(response).value).to.eql(effects.put(receiveAutocompleteProductsAction));
        expect(receiveAutocompleteProducts).to.be.calledWith(response);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveAutocompleteProductsAction: any = { a: 'b' };
        const receiveAutocompleteProducts = spy(() => receiveAutocompleteProductsAction);
        const flux: any = {
          actions: { receiveAutocompleteProducts }
        };
        stub(RequestHelpers, 'autocompleteProducts');

        const task = Tasks.fetchProducts(flux, <any>{ payload: {} });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveAutocompleteProductsAction));
        expect(receiveAutocompleteProducts).to.be.calledWith(error);
        task.next();
      });
    });
  });
});
