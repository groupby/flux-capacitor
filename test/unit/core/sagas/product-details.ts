import * as effects from 'redux-saga/effects';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import Events from '../../../../src/core/events';
import { productDetailsRequest } from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/product-details';
import Requests from '../../../../src/core/sagas/requests';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('product details saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PRODUCT_DETAILS, Tasks.fetchProductDetails, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchProductDetails()', () => {
      it('should call receiveDetails', () => {
        const id = '123';
        const search = () => null;
        const record = { allMeta: { e: 'f' } };
        const request = { g: 'h' };
        const receiveDetailsAction: any = { a: 'b' };
        const receiveDetails = spy(() => receiveDetailsAction);
        const template = { c: 'd' };
        const emit = spy();
        const flux: any = { actions: { receiveDetails }, emit };
        const searchRequest = stub(Requests, 'search').returns({ records: [record] });
        const state = { a: 'b' };
        stub(productDetailsRequest, 'composeRequest').withArgs(state, {
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: id }]
        }).returns(request);

        const task = Tasks.fetchProductDetails(flux, <any>{ payload: { id } });

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call(searchRequest, flux, request));
        expect(task.next({ records: [record], template }).value).to.eql(
          effects.put(receiveDetailsAction)
        );
        expect(emit).to.be.calledWithExactly(Events.BEACON_VIEW_PRODUCT, record);
        expect(receiveDetails).to.be.calledWith({ data: record.allMeta, template });
        task.next();
      });

      it('should handle product not found', () => {
        const error = new Error();
        const receiveDetailsAction: any = { a: 'b' };
        const receiveDetails = spy(() => receiveDetailsAction);
        const flux: any = {
          actions: { receiveDetails }
        };
        stub(productDetailsRequest, 'composeRequest').returns({ records: [] });

        const task = Tasks.fetchProductDetails(flux, <any>{ payload: {} });

        task.next();
        task.next();
        expect(task.next({ records: [] }).value).to.eql(effects.put(receiveDetailsAction));
        expect(receiveDetails).to.be.calledWith(sinon.match.instanceOf(Error));
        task.next();
      });

      it('should override request', () => {
        const id = '123';
        const state = { a: 'b' };
        const override = { c: 'd' };
        const composeRequest = stub(productDetailsRequest, 'composeRequest');

        const task = Tasks.fetchProductDetails(null, <any>{ payload: { id, request: override } });

        task.next();
        task.next(state);
        expect(composeRequest).to.be.calledWith(state, {
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: id }],
          ...override,
        });
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveDetailsAction: any = { a: 'b' };
        const receiveDetails = spy(() => receiveDetailsAction);
        const flux: any = {
          actions: { receiveDetails }
        };

        const task = Tasks.fetchProductDetails(flux, <any>{ payload: {} });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveDetailsAction));
        expect(receiveDetails).to.be.calledWith(error);
        task.next();
      });
    });
  });
});
