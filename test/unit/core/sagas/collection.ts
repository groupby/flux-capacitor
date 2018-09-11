import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapters from '../../../../src/core/adapters';
import { collectionRequest } from '../../../../src/core/requests';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/collection';
import Requests from '../../../../src/core/sagas/requests';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('collection saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeEvery(Actions.FETCH_COLLECTION_COUNT, Tasks.fetchCount, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchCount()', () => {
      it('should return collection count', () => {
        const collection = 'myCollection';
        const receiveCollectionCountAction: any = { c: 'd' };
        const receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const flux: any = { actions: { receiveCollectionCount } };
        const recordCount = 89;
        const request = { e: 'f', collection };
        const response = { g: 'h', totalRecordCount: recordCount };
        const searchRequest = stub(Requests, 'search').returns(response);
        const state = { a: 'b' };
        stub(collectionRequest, 'composeRequest').withArgs(state, { collection }).returns(request);

        const task = Tasks.fetchCount(flux, <any>{ payload: { collection } });

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call(searchRequest, flux, request));
        expect(task.next(response).value).to.eql(effects.put(receiveCollectionCountAction));
        expect(receiveCollectionCount).to.be.calledWithExactly({ collection, count: recordCount });
        task.next();
      });

      it('should override request', () => {
        const collection = 'myCollection';
        const state = { a: 'b' };
        const override = { c: 'd' };
        const composeRequest = stub(collectionRequest, 'composeRequest');

        const task = Tasks.fetchCount(null, <any>{ payload: { collection, request: override } });

        task.next();
        task.next(state);
        expect(composeRequest).to.be.calledWith(state, { collection, ...override });
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveCollectionCountAction: any = { a: 'b' };
        const receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const flux: any = {
          actions: { receiveCollectionCount }
        };

        const task = Tasks.fetchCount(flux, <any>{ payload: {} });

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveCollectionCountAction));
        expect(receiveCollectionCount).to.be.calledWith(error);
        task.next();
      });
    });
  });
});
