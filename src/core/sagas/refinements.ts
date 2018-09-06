import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import * as utils from '../actions/utils';
import RecommendationsAdapter from '../adapters/recommendations';
import Adapter from '../adapters/refinements';
import Events from '../events';
import { refinementsRequest } from '../requests';
import Selectors from '../selectors';
import Store from '../store';
import Requests from './requests';

export namespace Tasks {
  // tslint:disable-next-line max-line-length
  export function* fetchMoreRefinements(flux: FluxCapacitor, { payload }: Actions.FetchMoreRefinements) {
    try {
      const state: Store.State = yield effects.select();
      const config = yield effects.select(Selectors.config);
      const requestBody = refinementsRequest.composeRequest(state, payload.request);
      const res = yield effects.call(Requests.refinements, flux, requestBody, payload.navigationId);

      flux.emit(Events.BEACON_MORE_REFINEMENTS, payload.navigationId);
      res.navigation = RecommendationsAdapter.sortAndPinNavigations(
        [res.navigation],
        Selectors.navigationSort(flux.store.getState()),
        config
      )[0];
      const { navigationId, refinements, selected } = Adapter.mergeRefinements(res, state);
      yield effects.put(flux.actions.receiveMoreRefinements(navigationId, refinements, selected));
    } catch (e) {
      yield effects.put(utils.createAction(Actions.RECEIVE_MORE_REFINEMENTS, e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux);
};
