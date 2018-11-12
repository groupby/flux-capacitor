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
    it('should set the _barriers object with the events and callback', () => {
      const events = ['a', 'b'];
      const callback = () => ({});

      emitter.all(events, callback);

      expect(emitter._barriers['a:b']).to.eql({ events: { a: 0, b: 0 }, cb: [callback] });
    });

    it('should set the _lookups object with the event names', () => {
      const events = ['a', 'b'];
      const key = 'a:b';

      emitter.all(events, () => ({}));

      expect(emitter._lookups).to.eql({ a: [key], b: [key] });
    });

    it('should update the callbacks array when an event already exists in _barriers', () => {
      const events = ['a', 'b'];
      const callback1 = () => ({});
      const callback2 = () => ({});

      emitter.all(events, callback1);
      emitter.all(events, callback2);

      expect(emitter._barriers['a:b']).to.eql({ events: { a: 0, b: 0 }, cb: [callback1, callback2]  });
    });

    it('should update the _lookups array with a new key', () => {
      const events1 = ['a', 'b'];
      const events2 = ['a', 'c'];
      const key = 'a:b';
      const key2 = 'a:c';

      emitter.all(events1, () => ({}));
      emitter.all(events2, () => ({}));

      expect(emitter._lookups).to.eql({ a: [key, key2], b: [key], c: [key2] });
    });
  });

  describe('emit', () => {
    it('should update the _barriers counters if they exist', () => {
      const events = ['a', 'b'];
      const key = 'a:b';

      emitter.all(events, () => {});
      emitter.emit('a', null);

      expect(emitter._barriers[key].events.a).to.equal(1);
    });

    it('should invoke the callbacks if each event in a given collection has been emitted at least once', () => {
      const events = ['a', 'b'];
      const cb1 = spy();
      const cb2 = spy();

      emitter.all(events, cb1);
      emitter.all(events, cb2);
      events.forEach(ev => emitter.emit(ev, null));

      expect(cb1).to.have.been.called;
      expect(cb2).to.have.been.called;
    });
  });
});
