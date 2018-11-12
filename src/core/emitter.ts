import { EventEmitter } from 'eventemitter3';

class Emitter extends EventEmitter {
  _barriers: Barriers;
  _lookups: Lookups;

  constructor() {
    super();
    this._barriers = {};
    this._lookups = {};
  }

  emit(event: string, ...args: any[]): boolean {
    const result = super.emit(event, ...args);
    const keys = this._lookups[event] || [];

    keys.forEach((key) => {
      const inc = this._barriers[key].events[event] + 1;
      this._barriers[key].events = { ...this._barriers[key].events, [event]: inc };

      const shouldInvoke = Object.keys(this._barriers[key].events).every(ev => this._barriers[key].events[ev] >= 1);

      if (shouldInvoke) {
        this._barriers[key].cb.forEach(cb => cb());
      }
    });

    return result;
  }

  all(events: string[], cb: () => void) {
    const key = events.join(':');

    this._barriers[key] = {
      events: events.reduce((acc, ev) => ({ ...acc, [ev]: 0 }), {}),
      cb: this._barriers[key] ? [...this._barriers[key].cb, cb] : [cb],
    };

    this._lookups = events.reduce((acc, ev) => ({...acc, [ev]: this._lookups[ev] ? [...this._lookups[ev], key] : [key] }), this._lookups);
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
