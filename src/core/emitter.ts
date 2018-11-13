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
        this._barriers[key].cbs.forEach(({ cb, context }) => cb.apply(context));
        this._barriers[key].events = Object.keys(this._barriers[key].events).reduce((acc, ev ) => ({ ...acc, [ev]: 0 }), {});
      }
    });

    return result;
  }

  all(events: string[], cb: () => void, context = this) {
    const key = this.generateKey(events);

    this._barriers[key] = {
      events: events.reduce((acc, ev) => ({ ...acc, [ev]: 0 }), {}),
      cbs: this._barriers[key] ? [...this._barriers[key].cbs, { cb, context }] : [{ cb, context }],
    };

    this._lookups = events.reduce((acc, ev) => ({...acc, [ev]: this._lookups[ev] ? [...this._lookups[ev], key] : [key] }), this._lookups);
  }

  allOff(events: string[], cb: () => void) {
    const key = this.generateKey(events);
    const barrier = this._barriers[key];

   if (barrier) {
     this._barriers[key].cbs = this._barriers[key].cbs.filter(({ cb: fn }) => fn !== cb);

     events.forEach(ev => {
       this._lookups[ev] = this._lookups[ev].filter(k => k !== key);
     });
   }
  }

  generateKey(events: string[]) {
    return events.slice(0).sort().join(':');
  }
}

export interface E {
  [key: string]: number;
}

export interface Listener {
 context: any;
 cb: () => void;
}

export interface Barrier {
  events: E;
  cbs: Listener[];
}

export interface Barriers {
  [key: string]: Barrier;
}

export interface Lookups {
  [key: string]: string[];
}

export default Emitter;
