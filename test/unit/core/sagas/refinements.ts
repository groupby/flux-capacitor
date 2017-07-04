import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/refinements';
import suite from '../../_suite';

suite('refinements saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux));
    });
  });
});
