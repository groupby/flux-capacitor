import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import Adapters from '../../../../src/core/adapters';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/collection';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('collection saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_COLLECTION_COUNT, Tasks.fetchCount, flux));
    });
  });

  describe('Tasks', () => {
    describe('fetchCount()', () => {
      it('should return collection count', () => {
        const search = () => null;
        const config: any = { a: 'b' };
        const bridge = { search };
        const collection = 'myCollection';
        const receiveCollectionCountAction: any = { c: 'd' };
        const receiveCollectionCount = spy(() => receiveCollectionCountAction);
        const flux: any = { clients: { bridge }, actions: { receiveCollectionCount }, config };
        const recordCount = 89;
        const extractRecordCount = stub(Adapters.Search, 'extractRecordCount').returns(recordCount);

        const task = Tasks.fetchCount(flux, <any>{ payload: collection });

        expect(task.next().value).to.eql(effects.select(Selectors.searchRequest, config));
        expect(task.next().value).to.eql(effects.call([bridge, search], { collection }));
        expect(task.next().value).to.eql(effects.put(receiveCollectionCountAction));
        expect(receiveCollectionCount).to.be.calledWith({ collection, count: recordCount });
        expect(extractRecordCount).to.be.calledWith(undefined);
      });

      it('should handle request failure', () => {
        const receiveCollectionCount = spy(() => ({}));
        const flux: any = {
          clients: { bridge: { search: () => null } },
          actions: { receiveCollectionCount }
        };
        const error = new Error('some error');
        stub(Adapters.Search, 'extractRecordCount').throws(error);

        const task = Tasks.fetchCount(flux, <any>{});

        task.next();
        task.next();
        task.next();
        expect(receiveCollectionCount).to.be.calledWith(error);
      });
    });
  });
});
