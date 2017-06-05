import { ActionCreator, Actions, Store } from '../../../../src/flux/core';
import recordCount from '../../../../src/flux/core/reducers/record-count';
import suite from '../../_suite';

suite('record-count', ({ expect }) => {
  let actions: ActionCreator;
  const state = 2934;
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateRecordCount()', () => {
    it('should update record count on RECEIVE_PRODUCTS', () => {
      const newCount = 2039;

      const reducer = recordCount(state, { type: Actions.RECEIVE_PRODUCTS, recordCount: newCount });

      expect(reducer).to.eql(newCount);
    });

    it('should return state on default', () => {
      const reducer = recordCount(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
