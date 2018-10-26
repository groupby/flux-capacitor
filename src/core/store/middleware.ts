import * as cuid from 'cuid';
import { applyMiddleware, compose, createStore, Middleware as ReduxMiddleware, Store } from 'redux';
import { batchActions, batchMiddleware, batchStoreEnhancer, POP, PUSH } from 'redux-batch-enhancer';
import { ActionCreators as ReduxActionCreators } from 'redux-undo';
import * as validatorMiddleware from 'redux-validator';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import ActionCreators from '../actions/creators';
import ConfigurationAdapter from '../adapters/configuration';
import PersonalizationAdapter from '../adapters/personalization';
import Events from '../events';
import Selectors from '../selectors';
import * as utils from '../utils';

export const RECALL_CHANGE_ACTIONS = [
  Actions.RESET_REFINEMENTS,
  Actions.UPDATE_QUERY,
  Actions.ADD_REFINEMENT,
  Actions.SELECT_REFINEMENT,
  Actions.DESELECT_REFINEMENT,
];

export const SEARCH_CHANGE_ACTIONS = [
  ...RECALL_CHANGE_ACTIONS,
  Actions.SELECT_COLLECTION,
  Actions.SELECT_SORT,
  Actions.UPDATE_PAGE_SIZE,
  Actions.UPDATE_CURRENT_PAGE,
];

export const PAST_PURCHASES_SEARCH_CHANGE_ACTIONS = [
  Actions.UPDATE_PAST_PURCHASE_QUERY,
  Actions.RESET_PAST_PURCHASE_REFINEMENTS,
  Actions.SELECT_PAST_PURCHASE_REFINEMENT,
  Actions.DESELECT_PAST_PURCHASE_REFINEMENT,
  Actions.SELECT_PAST_PURCHASE_SORT,
  Actions.UPDATE_PAST_PURCHASE_CURRENT_PAGE,
  Actions.UPDATE_PAST_PURCHASE_PAGE_SIZE,
];

export const DETAILS_CHANGE_ACTIONS = [
  Actions.UPDATE_DETAILS,
];

export const SAVE_STATE_ACTIONS = [
  ...SEARCH_CHANGE_ACTIONS,
  ...PAST_PURCHASES_SEARCH_CHANGE_ACTIONS,
  ...DETAILS_CHANGE_ACTIONS
];

export const PERSONALIZATION_CHANGE_ACTIONS = [
  Actions.SELECT_REFINEMENT,
  Actions.ADD_REFINEMENT,
];

export const PAST_PURCHASE_SKU_ACTIONS = [
  Actions.FETCH_PAST_PURCHASE_PRODUCTS,
  Actions.FETCH_SAYT_PAST_PURCHASES,
];

export const UNDOABLE_ACTIONS = [
  Actions.RECEIVE_PRODUCTS,
  Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS,
  Actions.RECEIVE_COLLECTION_COUNT,
  Actions.RECEIVE_NAVIGATION_SORT,
  Actions.RECEIVE_MORE_REFINEMENTS,
  Actions.RECEIVE_PAST_PURCHASE_PRODUCTS,
];

export namespace Middleware {
  export const validator = validatorMiddleware();

  export function idGenerator(key: string, actions: string[]): ReduxMiddleware {
    return (store) => (next) => (action) =>
      actions.includes(action.type)
        ? next({ ...action, meta: { ...action.meta, [key]: cuid() } })
        : next(action);
  }

  export function errorHandler(flux: FluxCapacitor): ReduxMiddleware {
    return (store) => (next) => (action) => {
      if (action.error) {
        if (UNDOABLE_ACTIONS.includes(action.type)) {
          flux.emit(Events.ERROR_FETCH_ACTION, action.payload);
          return next(ReduxActionCreators.undo());
        } else {
          flux.emit(Events.ERROR_ACTION, action.payload);
          return action.payload;
        }
      } else {
        return next(action);
      }
    };
  }

  export function injectStateIntoRehydrate({ getState }: Store<any>) {
    return (next) => (action) =>
      action.type === 'persist/REHYDRATE' && action.payload && action.payload.biasing ? next({
        ...action,
        payload: {
          ...action.payload,
          biasing: PersonalizationAdapter.transformFromBrowser(action.payload.biasing, getState())
        }
      }) : next(action);
  }

  export function checkPastPurchaseSkus(flux: FluxCapacitor): ReduxMiddleware {
    return (store) => (next) => (action) => {
      if (!PAST_PURCHASE_SKU_ACTIONS.includes(action.type) ||
          Selectors.pastPurchases(flux.store.getState()).length > 0) {
        return next(action);
      }
      if (ConfigurationAdapter.extractSecuredPayload(Selectors.config(flux.store.getState()))) {
        flux.once(Events.PAST_PURCHASE_SKUS_UPDATED, () => store.dispatch(action));
      }
    };
  }

  export function personalizationAnalyzer({ getState, dispatch }: Store<any>) {
    return (next) => (action) => {
      if (ConfigurationAdapter.isRealTimeBiasEnabled(Selectors.config(getState())) &&
          PERSONALIZATION_CHANGE_ACTIONS.includes(action.type)) {
        const biasing = PersonalizationAdapter.extractBias(action, getState());
        if (biasing) {
          dispatch(ActionCreators.updateBiasing(biasing));
          return next(action);
        }
      }
      return next(action);
    };
  }

  export function saveStateAnalyzer() {
    let hasDispatched = false;
    let batchLevel = 0;
    return ({ dispatch }: Store<any>) => (next) => (action) => {
      if (action.type === PUSH) {
        batchLevel++;
      } else if (action.type === POP) {
        batchLevel--;
      } else if (SAVE_STATE_ACTIONS.includes(action.type) && !hasDispatched) {
        hasDispatched = true;
        dispatch({ type: Actions.SAVE_STATE });
      }

      if (batchLevel === 0) {
        hasDispatched = false;
      }

      return next(action);
    };
  }

  export function thunkEvaluator({ getState }: Store<any>) {
    return (next) => (thunkAction) => {
      if (typeof thunkAction === 'function') {
        return next(thunkAction(getState()));
      } else {
        return next(thunkAction);
      }
    };
  }

  export function arrayMiddleware() {
    return (next) => (action) => {
      return next(Array.isArray(action) ? batchActions(action) : action);
    };
  }

  export function create(sagaMiddleware: any, flux: FluxCapacitor): any {
    const normalizingMiddleware = [
      thunkEvaluator,
      arrayMiddleware,
      batchMiddleware,
    ];
    const middleware = [
      ...normalizingMiddleware,
      Middleware.saveStateAnalyzer(),
      Middleware.injectStateIntoRehydrate,
      Middleware.validator,
      Middleware.idGenerator('recallId', RECALL_CHANGE_ACTIONS),
      Middleware.idGenerator('searchId', SEARCH_CHANGE_ACTIONS),
      Middleware.idGenerator('pastPurchaseId', PAST_PURCHASES_SEARCH_CHANGE_ACTIONS),
      Middleware.idGenerator('detailsId', DETAILS_CHANGE_ACTIONS),
      Middleware.errorHandler(flux),
      Middleware.checkPastPurchaseSkus(flux),
      sagaMiddleware,
      Middleware.personalizationAnalyzer,
      ...normalizingMiddleware,
    ];

    // tslint:disable-next-line max-line-length
    if (process.env.NODE_ENV === 'development' && ((((<any>flux.__config).services || {}).logging || {}).debug || {}).flux) {
      middleware.push(require('redux-logger').default);
    }

    const composeEnhancers = global && global['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

    return composeEnhancers(
      applyMiddleware(...middleware),
      batchStoreEnhancer,
    );
  }
}

export default Middleware;
