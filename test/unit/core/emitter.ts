import { EventEmitter } from 'eventemitter3';
import * as sinon from 'sinon';
import Emitter from '../../../src/core/emitter';
import Events from '../../../src/core/events';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite.only('Emitter', ({ expect, spy, stub }) => {
  let emitter;

  beforeEach(() => {
    emitter = new Emitter();
  });

  describe('constructor()', () => {
    it('should extend EventEmitter', () => {
      expect(emitter).to.be.an.instanceOf(EventEmitter);
    });

    it('should set _barriers and _lookups', () => {
      expect(emitter._barriers).to.eql({});
      expect(emitter._lookups).to.eql({});
    });
  });

  describe('all()', () => {
    it('should update the _barriers object with the events and callback', () => {
      const events = ['a', 'b'];
      const callback = () => {};

      emitter.all(events, callback);

      expect(emitter._barriers['a:b']).to.eql({ events: { a: 0, b: 0 }, cb: [callback] });
    });

    it('should update the _lookups object with the event names', () => {
      const events = ['a', 'b'];
      const key = 'a:b';

      emitter.all(events, () => {});

      expect(emitter._lookups).to.eql({ a: [key], b: [key] });
    });
  });
});
