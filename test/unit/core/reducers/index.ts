import Actions from '../../../../src/core/actions';
import reducer, * as reducers from '../../../../src/core/reducers';
import * as dataReducer from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {
  it('should handle REFRESH_STATE action', () => {
    const state = { a: 'b' };

    expect(reducer({}, { type: Actions.REFRESH_STATE, state })).to.eq(state);
  });

  it('should return default', () => {
    const state = { a: 'b' };
    stub(reducers, 'rootReducer').returns(state);

    expect(reducer({}, { type: '' })).to.eq(state);
  });
});
