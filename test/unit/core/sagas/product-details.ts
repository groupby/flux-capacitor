import * as effects from 'redux-saga/effects';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/product-details';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('product details saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PRODUCT_DETAILS, Tasks.fetchProductDetails, flux));
    });
  });

  describe('Tasks', () => {
    describe('fetchProductDetails()', () => {
      it('should return product details', () => {
        const id = '123';
        const config: any = { a: 'b' };
        const search = () => null;
        const emit = spy();
        const saveState = spy();
        const bridge = { search };
        const receiveDetailsProductAction: any = { c: 'd' };
        const receiveDetailsProduct = spy(() => receiveDetailsProductAction);
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveDetailsProduct }, config };

        const task = Tasks.fetchProductDetails(flux, <any>{ payload: id });

        expect(task.next().value).to.eql(effects.select(Selectors.searchRequest, config));
        expect(task.next().value).to.eql(effects.call([bridge, search], {
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: id }]
        }));
        expect(task.next().value).to.eql(effects.put(receiveDetailsProductAction));
      });

      it('should handle request failure', () => {
        const receiveDetailsProduct = spy(() => ({}));
        const flux: any = {
          clients: { bridge: { search: () => null } },
          actions: { receiveDetailsProduct }
        };

        const task = Tasks.fetchProductDetails(flux, <any>{});

        task.next();
        task.next();
        task.next();
        expect(receiveDetailsProduct).to.be.calledWith(sinon.match.instanceOf(Error));
      });
    });
  });
});
