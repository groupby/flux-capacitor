import { Store as ReduxStore } from 'redux';
import FluxCapacitor from '../flux-capacitor';
import * as Events from './events';
import Store from './store';
import { rayify } from './utils';

export const DETAIL_QUERY_INDICATOR = 'gbiDetailQuery';
export const FETCH_EVENTS = {
  autocompleteProducts: Events.FETCH_AUTOCOMPLETE_PRODUCTS_DONE,
  autocompleteSuggestions: Events.FETCH_AUTOCOMPLETE_SUGGESTIONS_DONE,
  details: Events.FETCH_DETAILS_DONE,
  moreRefinements: Events.FETCH_MORE_REFINEMENTS_DONE,
  moreProducts: Events.FETCH_MORE_PRODUCTS_DONE,
  search: Events.FETCH_SEARCH_DONE,
};

type Observer = (oldState: any, newState: any, path: string) => void;

namespace Observer {
  export interface Map { [key: string]: Observer | Map; }
  export type Node = Map | Observer | (Observer & Map);

  export const listener = (flux: FluxCapacitor) =>
    (store: ReduxStore<Store.State>) => Observer.listen(flux, store);

  export function listen(flux: FluxCapacitor, store: ReduxStore<Store.State>) {
    let savedState = store.getState();

    return () => {
      const oldState = savedState;
      const newState = savedState = store.getState();

      Observer.resolve(oldState, newState, Observer.create(flux), '[root]');
    };
  }

  export function resolve(oldState: any, newState: any, observer: Node, path: string) {
    if (oldState !== newState) {
      if (typeof observer === 'function') {
        observer(oldState, newState, path);
      }

      Object.keys(observer)
        .forEach((key) => Observer.resolve(
          (oldState || {})[key],
          (newState || {})[key],
          observer[key],
          `${path}.${key}`
        ));
    }
  }

  export function terminal(oldState: any, newState: any, observer: Observer, path: string) {
    if (oldState !== newState) {
      observer(oldState, newState, path);
    }
  }

  export function indexed(emit: Observer) {
    return (oldState, newState, path) =>
      Object.keys(newState)
        .forEach((key) => Observer.terminal(oldState[key], newState[key], emit, `${path}.${key}`));
  }

  export function create(flux: FluxCapacitor) {
    const emit = (event: string) => (_, newValue, path) => {
      flux.emit(event, newValue);
      flux.emit(Events.OBSERVER_NODE_CHANGED, { event, path, value: newValue });
    };

    return {
      data: {
        autocomplete: ((emitSuggestionsUpdated: Observer, emitQueryUpdated: Observer, emitProductsUpdated: Observer) =>
          (oldState: Store.Autocomplete, newState: Store.Autocomplete, path: string) => {
            if (oldState !== newState) {
              if (oldState.suggestions !== newState.suggestions
                || oldState.category !== newState.category
                || oldState.navigations !== newState.navigations) {
                emitSuggestionsUpdated(oldState, newState, path);
              }
              if (oldState.query !== newState.query) {
                emitQueryUpdated(oldState.query, newState.query, `${path}.query`);
              }
              if (oldState.products !== newState.products) {
                emitProductsUpdated(oldState.products, newState.products, `${path}.products`);
              }
            }
            // tslint:disable-next-line max-line-length
          })(emit(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED), emit(Events.AUTOCOMPLETE_QUERY_UPDATED), emit(Events.AUTOCOMPLETE_PRODUCTS_UPDATED)),

        collections: {
          byId: Observer.indexed(emit(Events.COLLECTION_UPDATED)),
          selected: emit(Events.SELECTED_COLLECTION_UPDATED),
        },

        details: {
          id: emit(Events.DETAILS_ID_UPDATED),
          product: emit(Events.DETAILS_PRODUCT_UPDATED),
        },

        navigations: ((emitIndexUpdated) =>
          (oldState: Store.Indexed<Store.Navigation>, newState: Store.Indexed<Store.Navigation>, path) => {
            if (oldState.allIds !== newState.allIds) {
              emitIndexUpdated(oldState, newState, path);
            } else {
              newState.allIds.forEach((id) => {
                const oldNavigation = oldState.byId[id];
                const newNavigation = newState.byId[id];
                if (oldNavigation.selected !== newNavigation.selected
                  || oldNavigation.refinements !== newNavigation.refinements) {
                  // tslint:disable-next-line max-line-length
                  emit(`${Events.SELECTED_REFINEMENTS_UPDATED}:${id}`)(oldNavigation, newNavigation, `${path}.byId.${id}`);
                }
              });
            }
          })(emit(Events.NAVIGATIONS_UPDATED)),

        page: Object.assign(emit(Events.PAGE_UPDATED), {
          current: emit(Events.CURRENT_PAGE_UPDATED),
          sizes: emit(Events.PAGE_SIZE_UPDATED)
        }),

        products: ((emitMoreProductsAdded, emitProductsUpdated) =>
          (oldState: Store.Product[], newState: Store.Product[], path) => {
            const oldLength = oldState.length;
            if (oldLength < newState.length && oldState[0] === newState[0]) {
              emitMoreProductsAdded(oldState, newState.slice(oldLength), path);
            } else {
              emitProductsUpdated(oldState, newState, path);
            }
          })(emit(Events.MORE_PRODUCTS_ADDED), emit(Events.PRODUCTS_UPDATED)),

        query: {
          corrected: emit(Events.CORRECTED_QUERY_UPDATED),
          didYouMean: emit(Events.DID_YOU_MEANS_UPDATED),
          original: emit(Events.ORIGINAL_QUERY_UPDATED),
          related: emit(Events.RELATED_QUERIES_UPDATED),
          rewrites: emit(Events.QUERY_REWRITES_UPDATED),
        },

        recordCount: emit(Events.RECORD_COUNT_UPDATED),

        reditect: emit(Events.REDIRECT),

        sorts: emit(Events.SORTS_UPDATED),

        template: emit(Events.TEMPLATE_UPDATED),
      },
      isRunning: (oldState, newState, path) => {
        if (newState) {
          emit(Events.APP_STARTED)(oldState, newState, path);
        } else if (oldState) {
          emit(Events.APP_KILLED)(oldState, newState, path);
        }
      },
      isFetching: (oldState, newState) =>
        Object.keys(newState)
          .forEach((key) => {
            if (!oldState[key] && newState[key]) {
              flux.emit(FETCH_EVENTS[key]);
            }
          }),
      session: {
        recallId: emit(Events.RECALL_CHANGED),
        searchId: emit(Events.SEARCH_CHANGED)
      },
      ui: emit(Events.UI_UPDATED)
    };
  }
}

export default Observer;
