import reducer from '../../../../../src/core/reducers/data';
import suite from '../../../_suite';

suite('reducers', ({ expect, stub }) => {
  let dataReducer;

  beforeEach(() => {
    dataReducer = reducer('section' as any);
  });

  describe('fields', () => {
    const type = 'NOT AN ACTUAL ACTION';

    it('should have the default state in field be an array', () => {
      expect(dataReducer({}, { type, payload: undefined })['fields']).to.eql([]);
    });

    it('should just return the given state if anything else passed in', () => {
      const fields = 'test';

      expect(dataReducer({ fields  }, { type, payload: undefined }) ['fields']).to.eql(fields);
    });
  });
});
