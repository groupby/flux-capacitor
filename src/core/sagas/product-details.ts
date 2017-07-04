import { call, put, select, takeLatest, ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapters from '../adapters';
import * as Events from '../events';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export default (flux: FluxCapacitor) => {
  function* fetchProductDetails(action: Actions.FetchProductDetails) {
    try {
      const state: Store.State = yield select();
      const { records: [record] } = yield call([flux.clients.bridge, flux.clients.bridge.search], <any>{
        ...Selectors.searchRequest(state, flux.config),
        query: null,
        pageSize: 1,
        skip: 0,
        refinements: [{ navigationName: 'id', type: 'Value', value: action.payload }]
      });

      flux.emit(Events.BEACON_VIEW_PRODUCT, record);
      yield put(flux.actions.receiveDetailsProduct(record.allMeta));
      flux.saveState(utils.Routes.DETAILS);
    } catch (e) {
      yield put(flux.actions.receiveDetailsProduct(e));
    }
  }

  return function* saga() {
    yield takeLatest(Actions.FETCH_PRODUCT_DETAILS, fetchProductDetails);
  };
};
