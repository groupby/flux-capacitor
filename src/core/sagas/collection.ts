import { call, put, select, takeLatest, ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapters from '../adapters';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export default (flux: FluxCapacitor) => {
  function* fetchCount({ payload: collection }: Actions.FetchCollectionCount) {
    try {
      const state: Store.State = yield select();
      const res = yield call([flux.clients.bridge, flux.clients.bridge.search], {
        ...Selectors.searchRequest(state, flux.config),
        collection
      });

      yield put(flux.actions.receiveCollectionCount({ collection, count: Adapters.Search.extractRecordCount(res) }));
    } catch (e) {
      yield put(flux.actions.receiveCollectionCount(e));
    }
  }

  return function* saga() {
    yield takeLatest(Actions.FETCH_COLLECTION_COUNT, fetchCount);
  };
};
