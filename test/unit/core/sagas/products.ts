import * as effects from 'redux-saga/effects';
import { ActionCreators } from 'redux-undo';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/products';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('products saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProducts, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux));
    });
  });

  describe('Tasks', () => {
    describe('fetchProducts()', () => {
      it('should return products', () => {
        const config: any = { e: 'f' };
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const payload = { a: 'b' };
        const action: any = { payload };
        const receiveProductsAction: any = { c: 'd' };
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts }, config };

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.select(Selectors.searchRequest, config));
        expect(task.next().value).to.eql(effects.call([bridge, search], undefined));
        // expect(task.next().value).to.eql(effects.put(receiveProductsAction));
        // expect(receiveProducts).to.be.called;
      });

      it.skip('should handle request failure', () => {
        const receiveProducts = spy(() => ({}));
        const flux: any = {
          emit: () => null,
          saveState: () => null,
          clients: { bridge: { search: () => null } },
          actions: { receiveProducts }
        };
        const error = new Error('some error');

        const task = Tasks.fetchProducts(flux, <any>{});

        task.next();
        task.next();
        task.next();
        expect(receiveProducts).to.be.calledWith(ActionCreators.undo());
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return more products', () => {
        const pageSize = 14;
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const action: any = { payload: pageSize };
        const receiveMoreProductsAction: any = { c: 'd' };
        const receiveMoreProducts = spy(() => receiveMoreProductsAction);
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveMoreProducts } };
        stub(Selectors, 'searchRequest').returns({ e: 'f' });
        stub(Selectors, 'products').returns(['a', 'b', 'c']);

        const task = Tasks.fetchMoreProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next().value).to.eql(effects.call([bridge, search], {
          e: 'f',
          pageSize,
          skip: 3
        }));
        expect(task.next().value).to.eql(effects.put(receiveMoreProductsAction));
        // expect(receiveMoreProducts).to.be.calledWith(undefined);
      });

      it.skip('should handle request failure', () => {
        const receiveAutocompleteProducts = spy(() => ({}));
        const flux: any = {
          clients: { sayt: { productSearch: () => null } },
          actions: { receiveAutocompleteProducts }
        };
        const error = new Error('some error');

        const task = Tasks.fetchProducts(flux, <any>{});

        task.next();
        task.next();
        expect(receiveAutocompleteProducts).to.be.calledWith(error);
      });
    });
  });
});
