import { EventEmitter } from 'eventemitter3';

class Emitter extends EventEmitter {
  _barriers: Barriers;
  _lookups: Lookups;

  constructor() {
    super();
    this._barriers = {};
    this._lookups = {};
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
