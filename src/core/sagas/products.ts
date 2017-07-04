import { call, put, select, takeLatest, ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapters from '../adapters';
import * as Events from '../events';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export default (flux: FluxCapacitor) => {
  function* fetchProducts(action: Actions.FetchProducts) {
    try {
      const state: Store.State = yield select();
      // tslint:disable-next-line max-line-length
      const res = yield call([flux.clients.bridge, flux.clients.bridge.search], Selectors.searchRequest(state, flux.config));

      if (res.redirect) {
        yield put(flux.actions.receiveRedirect(res.redirect));
      }

      flux.emit(Events.BEACON_SEARCH, res.id);
      yield put(<any>flux.actions.receiveProducts(res));
      flux.saveState(utils.Routes.SEARCH);
    } catch (e) {
      yield put(<any>flux.actions.receiveProducts(e));
    }
  }

  function* fetchMoreProducts(action: Actions.FetchMoreProducts) {
    try {
      const state: Store.State = yield select();
      const { records: products, id } = yield call([flux.clients.bridge, flux.clients.bridge.search], {
        ...Selectors.searchRequest(state, flux.config),
        pageSize: action.payload,
        skip: Selectors.products(state).length
      });

      flux.emit(Events.BEACON_SEARCH, id);
      yield put(flux.actions.receiveMoreProducts(products));
    } catch (e) {
      yield put(flux.actions.receiveMoreProducts(e));
    }
  }

  return function* saga() {
    yield takeLatest(Actions.FETCH_PRODUCTS, fetchProducts);
    yield takeLatest(Actions.FETCH_MORE_PRODUCTS, fetchMoreProducts);
  };
};
