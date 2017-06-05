import { ActionCreator, Actions, Store } from '../../../../src/flux/core';
import sorts from '../../../../src/flux/core/reducers/sorts';
import suite from '../../_suite';

suite('sorts', ({ expect }) => {
  let actions: ActionCreator;
  const byId = {
    ['Price low to high']: { label: 'Price low to high', field: 'price', descending: false },
    ['Price high to low']: { label: 'Price high to low', field: 'price', descending: true },
  };
  const allIds = [];
  const state: Store.Indexed.Selectable<Store.Sort.Labeled> = {
    allIds,
    byId,
    selected: 'Price low to high',
  };
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateSorts()', () => {
    it('should update selected state on UPDATE_SORTS', () => {
      const newSelected = 'Price high to low';
      const newState = {
        ...state,
        selected: newSelected,
      };

      const reducer = sorts(state, { type: Actions.SELECT_SORT, id: newSelected });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = sorts(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
