import { EventEmitter } from 'eventemitter3';
import * as sinon from 'sinon';
import Emitter from '../../../src/core/emitter';
import Events from '../../../src/core/events';
import * as utils from '../../../src/core/utils';
import suite from '../_suite';

suite.only('Emitter', ({ expect, spy, stub }) => {
  describe('constructor()', () => {
    it('should extend EventEmitter', () => {
      expect(new Emitter()).to.be.an.instanceOf(EventEmitter);
    });
  });

  describe('emit()', () => {
    it('should', () => {

    });
  });
});
