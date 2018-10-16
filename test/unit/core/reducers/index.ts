import Actions from '../../../../src/core/actions';
import reducer, * as reducers from '../../../../src/core/reducers';
import * as dataReducers from '../../../../src/core/reducers/data';
import suite from '../../_suite';

suite('reducers', ({ expect, stub }) => {
  it('should handle REFRESH_STATE action', () => {
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
        past: [],
        present: {
          personalization: { biasing: 'not' },
          autocomplete: {},
          details: {}
        },
        future: []
      },
      session: {
        config: {
          history: {
            length: 5
          }
        }
      }
    };
    const newState = {
      a: 'b',
      data: {
        past: [{ personalization: { biasing: 'bias' }, autocomplete: { c: 'd' }, details: { data: '3' } }],
        present: { personalization: { biasing: 'not' }, autocomplete: {}, details: { data: '3' } },
        future: []
      },
      session: {
        config: {
          history: {
            length: 5
          }
        }
      }
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload })).to.eql(newState);
  });

  it('should keep the correct length of past', () => {
    const historyLength = 2;
    const payload = {
      a: 'b',
      data: {
        past: [{ a: 1 }, { b: 2 }],
        present: { personalization: { biasing: 2 }, autocomplete: {}, details: { data: 2 } },
        future: []
      }
    };
    const oldState = <any>{
      a: 'b',
      data: {
        present: { personalization: { biasing: 1 }, autocomplete: {}, details: { data: 1 } },
      },
      session: {
        config: { history: { length: historyLength } }
      }
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload }).data.past.length).to.eq(historyLength);
  });

  it('should keep the correct length of past if history should be 0', () => {
    const historyLength = 0;
    const payload = {
      a: 'b',
      data: {
        past: [],
        present: { personalization: { biasing: 2 }, autocomplete: {}, details: { data: 2 } },
        future: []
      }
    };
    const oldState = <any>{
      a: 'b',
      data: {
        present: { personalization: { biasing: 1 }, autocomplete: {}, details: { data: 1 } },
      },
      session: {
        config: { history: { length: historyLength } }
      }
    };

    expect(reducer(oldState, { type: Actions.REFRESH_STATE, payload }).data.past).to.eql([]);
  });

  describe('undo on HISTORY_UPDATE_ACTIONS', () => {
    const state = { a: 'b' };
    const present = { c: 'd' };

    beforeEach(() => {
      stub(dataReducers, 'default').returns(state);
    });

    reducers.HISTORY_UPDATE_ACTIONS.forEach((action) => {
      it(`should add to the past object on ${action}`, () => {
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
        }, <any>{ type: action });

        expect(updated.data.future).to.eql([]);
        expect(updated.data.past).to.eql([present]);
        expect(updated.data.present).to.eq(state);
      });
    });
  });

  it('should return default', () => {
    const state = { a: 'b' };
    stub(reducers, 'rootReducer').returns(state);

    expect(reducer(<any>{}, <any>{ type: '' })).to.eq(state);
  });
});
