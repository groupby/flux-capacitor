import { call, put, select, takeLatest, ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapters from '../adapters';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export default (flux: FluxCapacitor) => {
  function* fetchMoreRefinements(action: Actions.FetchMoreRefinements) {
    try {
      const state: Store.State = yield select();
      const { navigation: { name: navigationId, refinements } } = yield call(
        [flux.clients.bridge, flux.clients.bridge.refinements],
        Selectors.searchRequest(state, flux.config), action.payload);
      const navigation = Selectors.navigation(state, navigationId);
      const navigationType = navigation.range ? 'Range' : 'Value';
      const selectedRefinements = navigation.refinements
        .filter((_, index) => navigation.selected.includes(index));
      const remapped = refinements.map(Adapters.Search.extractRefinement);
      const selected = remapped.reduce((refs, refinement, index) => {
        // tslint:disable-next-line max-line-length
        const found = selectedRefinements.findIndex((ref: any) => Adapters.Search.refinementsMatch(refinement, ref, navigationType));
        if (found !== -1) {
          refs.push(index);
        }
        return refs;
      }, []);

      yield put(flux.actions.receiveMoreRefinements(navigationId, remapped, selected));
    } catch (e) {
      yield put(utils.action(Actions.RECEIVE_MORE_REFINEMENTS, e));
    }
  }

  return function* saga() {
    yield takeLatest(Actions.FETCH_MORE_REFINEMENTS, fetchMoreRefinements);
  };
};
