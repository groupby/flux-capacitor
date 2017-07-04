import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapter from '../../../../src/core/adapters/autocomplete';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/autocomplete';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('autocomplete saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, Tasks.fetchSuggestions, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, Tasks.fetchProducts, flux));
    });
  });

  describe('Tasks', () => {
    describe('fetchSuggestions()', () => {
      it('should return sayt suggestions', () => {
        const autocomplete = () => null;
        const sayt = { autocomplete };
        const query = 'rain boots';
        const config = { a: 'b' };
        const action: any = { payload: query };
        const receiveAutocompleteSuggestionsAction: any = { c: 'd' };
        const receiveAutocompleteSuggestions = spy(() => receiveAutocompleteSuggestionsAction);
        const flux: any = { clients: { sayt }, actions: { receiveAutocompleteSuggestions }, config };
        const suggestions = ['e', 'f'];
        const request = { g: 'h' };
        const autocompleteSuggestionsRequest = stub(Selectors, 'autocompleteSuggestionsRequest').returns(request);
        stub(Adapter, 'extractSuggestions').returns(suggestions);

        const task = Tasks.fetchSuggestions(flux, action);

        expect(task.next().value).to.eql(effects.select(Selectors.autocompleteCategoryField));
        expect(task.next().value).to.eql(effects.call([sayt, autocomplete], query, request));
        expect(task.next().value).to.eql(effects.put(receiveAutocompleteSuggestionsAction));
        expect(receiveAutocompleteSuggestions).to.be.calledWith(suggestions);
        expect(autocompleteSuggestionsRequest).to.be.calledWith(config);
      });

      it('should handle request failure', () => {
        const receiveAutocompleteSuggestions = spy(() => ({}));
        const flux: any = {
          clients: { sayt: { autocomplete: () => null } },
          actions: { receiveAutocompleteSuggestions }
        };
        const error = new Error('some error');
        stub(Adapter, 'extractSuggestions').throws(error);
        stub(Selectors, 'autocompleteSuggestionsRequest');

        const task = Tasks.fetchSuggestions(flux, <any>{});

        task.next();
        task.next();
        task.next();
        expect(receiveAutocompleteSuggestions).to.be.calledWith(error);
      });
    });

    describe('fetchProducts()', () => {
      it('should return sayt products', () => {
        const productSearch = () => null;
        const sayt = { productSearch };
        const query = 'umbrellas';
        const action: any = { payload: query };
        const receiveAutocompleteProductsAction: any = { c: 'd' };
        const receiveAutocompleteProducts = spy(() => receiveAutocompleteProductsAction);
        const flux: any = { clients: { sayt }, actions: { receiveAutocompleteProducts } };
        const products = ['e', 'f'];
        const request = { g: 'h' };
        const autocompleteProductsRequest = stub(Selectors, 'autocompleteProductsRequest').returns(request);
        stub(Adapter, 'extractProducts').returns(products);

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.call([sayt, productSearch], query, request));
        expect(task.next().value).to.eql(effects.put(receiveAutocompleteProductsAction));
        expect(receiveAutocompleteProducts).to.be.calledWith(products);
      });

      it('should handle request failure', () => {
        const receiveAutocompleteProducts = spy(() => ({}));
        const flux: any = {
          clients: { sayt: { productSearch: () => null } },
          actions: { receiveAutocompleteProducts }
        };
        const error = new Error('some error');
        stub(Selectors, 'autocompleteProductsRequest');
        stub(Adapter, 'extractProducts').throws(error);

        const task = Tasks.fetchProducts(flux, <any>{});

        task.next();
        task.next();
        expect(receiveAutocompleteProducts).to.be.calledWith(error);
      });
    });
  });
});
