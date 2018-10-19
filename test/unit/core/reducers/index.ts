import Actions from '../../../../src/core/actions';
import reducer, * as reducers from '../../../../src/core/reducers';
import * as dataReducers from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {
  it('should handle REFRESH_STATE action', () => {
    const session = { c: 'd' };
    const payload = {
      a: 'b',
      data: {
        past: [],
        present: {
          personalization: { biasing: 'bias' },
          autocomplete: { c: 'd' },
          details: { data: '3' }
        },
        future: [],
      }
    };
    const oldState = <any>{
      data: {
        past: [{ a: 'b' }],
        present: {
          personalization: { biasing: 'not' },
          autocomplete: {},
          details: {}
        },
        future: []
      },
      session,
    };
    const newState = {
      a: 'b',
      data: {
        past: [],
        present: { personalization: { biasing: 'not' }, autocomplete: {}, details: { data: '3' } },
        future: []
      },
      session,
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload })).to.eql(newState);
  });

  it('should preserve session', () => {
    const session = { c: 'd' };
    const payload = {
      a: 'b',
      data: {
        past: [{ a: 1 }],
        present: { personalization: { biasing: 2 }, autocomplete: {}, details: { data: 2 } },
        future: []
      }
    };
    const oldState = <any>{
      a: 'b',
      data: {
        present: { personalization: { biasing: 1 }, autocomplete: {}, details: { data: 1 } },
      },
      session,
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload }).session).to.eq(session);
  });

  it('should advance history on SAVE_STATE', () => {
    const state = { a: 'b' };
    const present = { c: 'd' };
    stub(dataReducers, 'default').returns(state);

    const updated = reducer(<any>{
      session: {
        config: {
          history: {
            length: 1
          }
        }
      },
      data: {
        past: [],
        present,
        future: []
      }
    }, <any>{ type: Actions.SAVE_STATE });

    expect(updated.data.future).to.eql([]);
    expect(updated.data.past).to.eql([present]);
    expect(updated.data.present).to.eq(state);
  });

  it('should return default', () => {
    const state = { a: 'b' };
    stub(reducers, 'rootReducer').returns(state);

    expect(reducer(<any>{}, <any>{ type: '' })).to.eq(state);
  });
});
