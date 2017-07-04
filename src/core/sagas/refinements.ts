import * as effects from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import Adapter from '../adapters/search';
import Selectors from '../selectors';
import Store from '../store';
import * as utils from '../utils';

export namespace Tasks {
  export function* fetchMoreRefinements(flux: FluxCapacitor, action: Actions.FetchMoreRefinements) {
    try {
      const state: Store.State = yield effects.select();
      const { navigation: { name: navigationId, refinements } } = yield effects.call(
        [flux.clients.bridge, flux.clients.bridge.refinements],
        Selectors.searchRequest(state, flux.config),
        action.payload
      );
      const navigation = Selectors.navigation(state, navigationId);
      const navigationType = navigation.range ? 'Range' : 'Value';
      const selectedRefinements = navigation.refinements
        .filter((_, index) => navigation.selected.includes(index));
      const remapped = refinements.map(Adapter.extractRefinement);
      const selected = remapped.reduce((refs, refinement, index) => {
        // tslint:disable-next-line max-line-length
        const found = selectedRefinements.findIndex((ref: any) => Adapter.refinementsMatch(refinement, ref, navigationType));
        if (found !== -1) {
          refs.push(index);
        }
        return refs;
      }, []);

      yield effects.put(flux.actions.receiveMoreRefinements(navigationId, remapped, selected));
    } catch (e) {
      yield effects.put(utils.action(Actions.RECEIVE_MORE_REFINEMENTS, e));
    }
  }
}

export default (flux: FluxCapacitor) => function* saga() {
  yield effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux);
};
