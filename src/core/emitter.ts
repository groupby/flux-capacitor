import { EventEmitter } from 'eventemitter3';

class Emitter extends EventEmitter {
  _barriers: Barriers;
  _lookups: Lookups;

  constructor() {
    super();
    this._barriers = {};
    this._lookups = {};
  }

  all(events: string[], cb: () => void) {
    const key = events.join(':');

    this._barriers[key] = {
      events: events.reduce((acc, ev) => ({ ...acc, [ev]: 0 }), {}),
      cb: [cb],
    };

    this._lookups = events.reduce((acc, ev) => ({...acc, [ev]: [key] }), this._lookups);
  }
}

export interface E {
  [key: string]: number;
}

export interface Barrier {
  events: E;
  cb: (() => void)[];
}

export interface Barriers {
  [key: string]: Barrier;
}

export interface Lookups {
  [key: string]: string[];
}

export default Emitter;
