import * as redux from 'redux';
import Actions from '../../../../../src/core/actions';
import reducer from '../../../../../src/core/reducers/data';
import * as autocomplete from '../../../../../src/core/reducers/data/autocomplete';
import suite from '../../../_suite';

suite('reducers', ({ expect, stub }) => {
  describe('fields', () => {
    it('should have the default state in field be an array', () => {
      const combineReducers = stub(redux, 'combineReducers');

      expect(reducer({}, { type: 'NOT AN ACTUAL ACTION',
                           payload: undefined })['fields']).to.eql([]);
    });
    it('should just return the given state if anything else passed in', () => {
      const combineReducers = stub(redux, 'combineReducers');
      const fields = 'test';

      expect(reducer({ fields  }, { type: 'NOT AN ACTUAL ACTION',
                                    payload: undefined }) ['fields']).to.eql(fields);
    });
  });
});
