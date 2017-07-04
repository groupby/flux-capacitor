import * as utils from '../../../src/core/utils';
import suite from '../_suite';

const ACTION = 'MY_ACTION';

suite('utils', ({ expect, spy }) => {

  describe('rayify()', () => {
    it('should return an array if the argument is a value', () => {
      expect(utils.rayify(20)).to.eql([20]);
      expect(utils.rayify('apple')).to.eql(['apple']);
      expect(utils.rayify({ a: 'b' })).to.eql([{ a: 'b' }]);
      expect(utils.rayify(true)).to.eql([true]);
    });

    it('should return the original argument if it is an array', () => {
      const array = [{ a: 'b' }, { c: 'd' }];

      expect(utils.rayify(array)).to.eq(array);
    });
  });

  describe('action()', () => {
    it('should build an FSA compliant action with empty meta', () => {
      expect(utils.action(ACTION)).to.eql({ type: ACTION, meta: {} });
    });

    it('should build an FSA compliant action with empty meta and a payload', () => {
      const payload = { a: 'b' };

      expect(utils.action(ACTION, payload)).to.eql({ type: ACTION, payload, meta: {} });
    });

    it('should build an FSA compliant action with meta and a payload', () => {
      const payload = { a: 'b' };
      const meta = { e: 'f' };

      expect(utils.action(ACTION, payload, meta)).to.eql({ type: ACTION, payload, meta });
    });
  });

  describe('thunk()', () => {
    it('should return a thunk that dispatches an action', () => {
      const dispatch = spy();
      const payload = { a: 'b' };
      const meta = { c: 'd' };
      const thunk = utils.thunk(ACTION, payload, meta);

      thunk(dispatch);

      expect(dispatch).to.be.calledWith({ type: ACTION, payload, meta });
    });
  });

  describe('conditional()', () => {
    it('should return a thunk that swallows an action if the predicate evaluates to a falsey value', () => {
      const predicate = spy();
      const payload = { a: 'b' };
      const meta = { c: 'd' };
      const state: any = { e: 'f' };
      const thunk = utils.conditional(predicate, ACTION, payload, meta);

      thunk(() => expect.fail(), () => state);

      expect(predicate).to.be.calledWith(state);
    });

    it('should return a thunk that dispatches an action if the predicate evaluates to a truthy value', () => {
      const dispatch = spy();
      const payload = { a: 'b' };
      const meta = { c: 'd' };
      const state: any = { e: 'f' };
      const thunk = utils.conditional(() => true, ACTION, payload, meta);

      thunk(dispatch, () => state);

      expect(dispatch).to.be.calledWith({ type: ACTION, payload, meta });
    });
  });
});
