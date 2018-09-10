import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Events from '../events';
import { productDetailsRequest } from '../requests';
import Store from '../store';
import * as utils from '../utils';
import Requests from './requests';

export namespace Tasks {
  export function* fetchProductDetails(flux: FluxCapacitor, { payload: { id, request } }: Actions.FetchProductDetails) {
    try {
      const state = yield effects.select();
      const requestBody =  productDetailsRequest.composeRequest(
        state,
        {
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: id }],
          ...request
        }
      );
      const { records, template } = yield effects.call(Requests.search, flux, requestBody);

      if (records.length !== 0) {
        const [record] = records;
        yield effects.put(flux.actions.setDetails(record, template));
      } else {
        throw new Error(`no records found matching id: ${id}`);
      }
    } catch (e) {
      yield effects.put(flux.actions.updateDetails(e));
    }
  }

  export function* receiveDetailsProduct(flux: FluxCapacitor, { payload }: Actions.SetDetails) {
    if (payload.data.allMeta) {
      flux.emit(Events.BEACON_VIEW_PRODUCT, payload.data);
      payload.data = payload.data.allMeta;
    }
    yield effects.put(flux.actions.updateDetails(payload));
    flux.saveState(utils.Routes.DETAILS);
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_PRODUCT_DETAILS, Tasks.fetchProductDetails, flux);
  yield effects.takeLatest(Actions.SET_DETAILS, Tasks.receiveDetailsProduct, flux);
};
