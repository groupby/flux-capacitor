import * as effects from 'redux-saga/effects';
import Actions from '../../../../src/core/actions';
import * as utils from '../../../../src/core/actions/utils';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import Adapter from '../../../../src/core/adapters/refinements';
import Events from '../../../../src/core/events';
import RequestHelpers from '../../../../src/core/requests/utils'
import sagaCreator, { Tasks } from '../../../../src/core/sagas/refinements';
import Requests from '../../../../src/core/sagas/requests';
import Selectors from '../../../../src/core/selectors';
import suite from '../../_suite';

suite('refinements saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b', actions: {} };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_MORE_REFINEMENTS, Tasks.fetchMoreRefinements, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchMoreRefinements()', () => {
      it('should return more refinements', () => {
        const navigationId = 'colour';
        const config = {
          recommendations: {
            iNav: {
              refinements: {
                sort: false,
                pinned: false
              }
            }
          }
        };
        const mergedRefinements = ['k', 'l'];
        const selected = ['m', 'n'];
        const refinements = () => null;
        const receiveMoreRefinementsAction: any = { c: 'd' };
        const receiveMoreRefinements = spy(() => receiveMoreRefinementsAction);
        const request = { g: 'h' };
        const state = { i: 'j'};
        const store = { getState: () => 1 };
        const results = { navigation: { sort: false, pinned: false }};
        const emit = spy();
        const flux: any = { actions: { receiveMoreRefinements }, store, emit };
        const refinementsRequest = stub(Requests, 'refinements').returns(results);
        const searchRequest = stub(RequestHelpers, 'search').returns(request);
        const mergeRefinements = stub(Adapter, 'mergeRefinements').returns({
          navigationId,
          refinements: mergedRefinements,
          selected
        });

        const task = Tasks.fetchMoreRefinements(flux, <any>{ payload: navigationId });
        stub(Selectors, 'navigationSort').returns([]);
        stub(RecommendationsAdapter, 'sortAndPinNavigations').returns(results);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.select(Selectors.config));
        expect(task.next(config).value).to.eql(effects.call(refinementsRequest, flux, request, navigationId));
        expect(task.next(results).value).to.eql(effects.put(receiveMoreRefinementsAction));
        expect(searchRequest).to.be.calledWithExactly(state);
        expect(mergeRefinements).to.be.calledWithExactly(results, state);
        expect(receiveMoreRefinements).to.be.calledWithExactly(navigationId, mergedRefinements, selected);
        expect(flux.emit).to.be.calledWithExactly(Events.BEACON_MORE_REFINEMENTS, navigationId);
        task.next();
      });

      it('should call sortRefinements and pinRefinements if sort and pinned exist in config', () => {
        const navigationId = 'colour';
        const config = {
          recommendations: {
            iNav: {
              refinements: {
                sort: true,
                pinned: {
                  1: ['1']
                }
              }
            }
          }
        };
        const mergedRefinements = ['k', 'l'];
        const selected = ['m', 'n'];
        const refinements = () => null;
        const receiveMoreRefinementsAction: any = { c: 'd' };
        const receiveMoreRefinements = spy(() => receiveMoreRefinementsAction);
        const sortAndPinNavigations = stub(RecommendationsAdapter, 'sortAndPinNavigations').returnsArg(0);
        const request = { g: 'h' };
        const state = { i: 'j'};
        const store = {
          getState: () => 1
        };
        const navigation = 'navigation';
        const results = { navigation };
        const flux: any = { actions: { receiveMoreRefinements }, store, emit: () => 1 };
        const searchRequest = stub(RequestHelpers, 'search').returns(request);
        const mergeRefinements = stub(Adapter, 'mergeRefinements').returns({
          navigationId,
          refinements: mergedRefinements,
          selected
        });

        const task = Tasks.fetchMoreRefinements(flux, <any>{ payload: navigationId });
        const sort = 1234;
        const navigationSort = stub(Selectors, 'navigationSort').returns(sort);

        task.next();
        task.next(state);
        task.next(config);
        task.next(results);
        expect(sortAndPinNavigations).to.be.calledWith([navigation], sort, config);
        task.next();
      });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveMoreRefinementsAction: any = { a: 'b' };
        const flux: any = {};
        const action = stub(utils, 'createAction').returns(receiveMoreRefinementsAction);

        const task = Tasks.fetchMoreRefinements(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveMoreRefinementsAction));
        expect(action).to.be.calledWith(Actions.RECEIVE_MORE_REFINEMENTS, error);
        task.next();
      });
    });
  });
});
