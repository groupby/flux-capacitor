import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/search';
import RequestHelpers from '../requests';
import Selectors from '../selectors';
import Requests from './requests';

export namespace Tasks {
  export function* fetchCount(flux: FluxCapacitor, { payload: collection }: Actions.FetchCollectionCount) {
    try {
      const request = yield effects.select(RequestHelpers.search);
      const res = yield effects.call(Requests.search, flux, { ...request, collection });

      yield effects.put(flux.actions.receiveCollectionCount({
        collection,
        count: res.totalRecordCount
      }));
    } catch (e) {
      yield effects.put(flux.actions.receiveCollectionCount(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeEvery(Actions.FETCH_COLLECTION_COUNT, Tasks.fetchCount, flux);
};
