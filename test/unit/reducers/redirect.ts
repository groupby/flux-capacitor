import { ActionCreator, Actions, Store } from '../../../../src/flux/core';
import redirect from '../../../../src/flux/core/reducers/redirect';
import suite from '../../_suite';

suite('redirect', ({ expect }) => {
  let actions: ActionCreator;
  const state = '/go-here';
  beforeEach(() => actions = new ActionCreator(<any>{}, <any>{}));

  describe('updateRedirect()', () => {
    it('should update redirect on RECEIVE_REDIRECT', () => {
      const newRedirect = '/no-go-here-instead';

      const reducer = redirect(state, { type: Actions.RECEIVE_REDIRECT, redirect: newRedirect });

      expect(reducer).to.eql(newRedirect);
    });

    it('should return state on default', () => {
      const reducer = redirect(state, {});

      expect(reducer).to.eql(state);
    });
  });
});
