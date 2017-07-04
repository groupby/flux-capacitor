import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import * as Events from '../events';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchProductDetails(flux: FluxCapacitor, action: Actions.FetchProductDetails) {
    try {
      const request = yield effects.select(Selectors.searchRequest, flux.config);
      const { records: [record] } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.search],
        {
          ...request,
          query: null,
          pageSize: 1,
          skip: 0,
          refinements: [{ navigationName: 'id', type: 'Value', value: action.payload }]
        }
      );

      flux.emit(Events.BEACON_VIEW_PRODUCT, record);
      yield effects.put(flux.actions.receiveDetailsProduct(record.allMeta));
      flux.saveState(utils.Routes.DETAILS);
    } catch (e) {
      yield effects.put(flux.actions.receiveDetailsProduct(e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_PRODUCT_DETAILS, Tasks.fetchProductDetails, flux);
};
