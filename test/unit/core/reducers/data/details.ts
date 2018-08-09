import { Actions, Store } from '../../../../../src/core';
import details from '../../../../../src/core/reducers/data/details';
import suite from '../../../_suite';

suite('details', ({ expect }) => {
  const id = '19283';
  const product = {
    id: '19293',
    price: 20,
    name: 'toy',
  };
  const product2 = {
    id: '13928',
    price: 53,
    name: 'pajamas',
  };
  const state: Store.Details = {
    data: product
  };
  const template: any = { c: 'd' };

  describe('updateDetails()', () => {
    it('should update state on UPDATE_DETAILS_ID', () => {
      const newState = {
        data: product2,
        template
      };

      const reducer = details(state, {
        type: Actions.UPDATE_DETAILS,
        payload: { data: product2, template }
      });

      expect(reducer).to.eql(newState);
    });

    it('should return state on default', () => {
      const reducer = details(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
