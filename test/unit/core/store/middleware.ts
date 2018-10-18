import * as redux from 'redux';
import { batchActions, batchMiddleware, batchStoreEnhancer, POP, PUSH } from 'redux-batch-enhancer';
import reduxLogger from 'redux-logger';
import { ActionCreators as ReduxActionCreators } from 'redux-undo';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import ActionCreators from '../../../../src/core/actions/creators';
import { handleError } from '../../../../src/core/actions/utils';
import ConfigurationAdapter from '../../../../src/core/adapters/configuration';
import PersonalizationAdapter from '../../../../src/core/adapters/personalization';
import Events from '../../../../src/core/events';
import Selectors from '../../../../src/core/selectors';
import Middleware, {
  DETAILS_CHANGE_ACTIONS,
  PAST_PURCHASE_SKU_ACTIONS,
  PAST_PURCHASES_SEARCH_CHANGE_ACTIONS,
  PERSONALIZATION_CHANGE_ACTIONS,
  RECALL_CHANGE_ACTIONS,
  SAVE_STATE_ACTIONS,
  SEARCH_CHANGE_ACTIONS,
  UNDOABLE_ACTIONS,
} from '../../../../src/core/store/middleware';
import suite from '../../_suite';

suite('Middleware', ({ expect, spy, stub }) => {
  let next: sinon.SinonSpy;
  let saveStateAnalyzer;

  beforeEach(() => {
    next = spy();
    saveStateAnalyzer = Middleware.saveStateAnalyzer();
    stub(Middleware, 'saveStateAnalyzer').returns(saveStateAnalyzer);
  });

  describe('create()', () => {
    const sagaMiddleware = { a: 'b' };
    const idGeneratorMiddleware = { g: 'h' };
    const errorHandlerMiddleware = { i: 'j' };
    const checkPastPurchaseSkusMiddleware = { m: 'n' };
    const validatorMiddleware = { m: 'n' };
    const allMiddleware = () => [
      Middleware.thunkEvaluator,
      Middleware.arrayMiddleware,
      batchMiddleware,
      saveStateAnalyzer,
      Middleware.injectStateIntoRehydrate,
      Middleware.validator,
      idGeneratorMiddleware,
      idGeneratorMiddleware,
      idGeneratorMiddleware,
      idGeneratorMiddleware,
      errorHandlerMiddleware,
      checkPastPurchaseSkusMiddleware,
      sagaMiddleware,
      Middleware.personalizationAnalyzer,
      Middleware.thunkEvaluator,
      Middleware.arrayMiddleware,
      batchMiddleware,
    ];
    const normalizingMiddleware = [
      Middleware.thunkEvaluator,
      Middleware.arrayMiddleware,
      batchMiddleware
    ];

    afterEach(() => delete process.env.NODE_ENV);

    it('should return composed middleware', () => {
      const flux: any = { __config: {} };
      const composed = ['e', 'f'];
      const simpleMiddleware = ['k', 'l'];
      const middlewares = ['k', 'l'];
      const thunkMiddleware = ['k', 'l'];
      const idGenerator = stub(Middleware, 'idGenerator').returns(idGeneratorMiddleware);
      const errorHandler = stub(Middleware, 'errorHandler').returns(errorHandlerMiddleware);
      const checkPastPurchaseSkus = stub(Middleware, 'checkPastPurchaseSkus').returns(checkPastPurchaseSkusMiddleware);
      const compose = stub(redux, 'compose').returns(composed);
      const applyMiddleware = stub(redux, 'applyMiddleware');
      applyMiddleware.withArgs(
        ...normalizingMiddleware,
        saveStateAnalyzer,
        Middleware.injectStateIntoRehydrate,
        Middleware.validator,
        idGeneratorMiddleware,
        idGeneratorMiddleware,
        idGeneratorMiddleware,
        idGeneratorMiddleware,
        errorHandlerMiddleware,
        checkPastPurchaseSkusMiddleware,
        sagaMiddleware,
        Middleware.personalizationAnalyzer,
        ...normalizingMiddleware,
      ).returns(middlewares);

      const middleware = Middleware.create(sagaMiddleware, flux);

      expect(idGenerator).to.have.callCount(4)
        .and.calledWithExactly('recallId', RECALL_CHANGE_ACTIONS)
        .and.calledWithExactly('searchId', SEARCH_CHANGE_ACTIONS)
        .and.calledWithExactly('pastPurchaseId', PAST_PURCHASES_SEARCH_CHANGE_ACTIONS)
        .and.calledWithExactly('detailsId', DETAILS_CHANGE_ACTIONS);
      expect(errorHandler).to.be.calledWithExactly(flux);
      expect(applyMiddleware).to.be.calledWithExactly(...allMiddleware());
      expect(compose).to.be.calledWithExactly(
        middlewares,
        batchStoreEnhancer,
      );
      expect(middleware).to.eql(composed);
    });

    it('should include redux-logger when running in development and debug set', () => {
      const flux: any = { __config: { services: { logging: { debug: { flux: true } } } } };
      const applyMiddleware = stub(redux, 'applyMiddleware');
      stub(Middleware, 'idGenerator').returns(idGeneratorMiddleware);
      stub(Middleware, 'errorHandler').returns(errorHandlerMiddleware);
      stub(Middleware, 'validator').returns(Middleware.validator);
      stub(Middleware, 'checkPastPurchaseSkus').returns(checkPastPurchaseSkusMiddleware);
      stub(redux, 'compose');
      process.env.NODE_ENV = 'development';

      Middleware.create(sagaMiddleware, flux);

      expect(applyMiddleware).to.be.calledWithExactly(...allMiddleware(), reduxLogger);
    });

    it('should not include redux-logger when running in development and debug not set', () => {
      const flux: any = { __config: {} };
      const applyMiddleware = stub(redux, 'applyMiddleware');
      stub(Middleware, 'idGenerator').returns(idGeneratorMiddleware);
      stub(Middleware, 'errorHandler').returns(errorHandlerMiddleware);
      stub(Middleware, 'validator').returns(Middleware.validator);
      stub(Middleware, 'checkPastPurchaseSkus').returns(checkPastPurchaseSkusMiddleware);
      stub(redux, 'compose');
      process.env.NODE_ENV = 'development';

      Middleware.create(sagaMiddleware, flux);

      expect(applyMiddleware).to.be.calledWithExactly(...allMiddleware());
    });
  });

  describe('idGenerator()', () => {
    it('should add id if action type is in whitelist', () => {
      const idKey = 'myId';
      const whitelist = ['a', 'b', 'c'];

      Middleware.idGenerator(idKey, whitelist)(null)(next)({ type: 'b', c: 'd' });

      expect(next).to.be.calledWith({ type: 'b', c: 'd', meta: { [idKey]: sinon.match.string } });
    });

    it('should augment existing meta', () => {
      const idKey = 'myId';
      const meta = { d: 'e' };

      Middleware.idGenerator(idKey, ['a', 'b', 'c'])(null)(next)({ type: 'b', c: 'd', meta });

      expect(next).to.be.calledWithExactly({ type: 'b', c: 'd', meta: { d: 'e', [idKey]: sinon.match.string } });
    });

    it('should not modify action if type not in whitelist', () => {
      const idKey = 'myId';
      const originalAction = { a: 'b', type: 'c' };

      Middleware.idGenerator(idKey, ['e', 'f', 'g'])(null)(next)(originalAction);

      expect(next).to.be.calledWith(originalAction);
    });
  });

  describe('errorHandler()', () => {
    it('should emit ERROR_ACTION if error is not present in UNDOABLE_ACTIONS', () => {
      const payload = { a: 'b' };
      const emit = spy();

      const error = Middleware.errorHandler(<any>{ emit })(null)(() => null)(<any>{ error: true, payload });

      expect(emit).to.be.calledWith(Events.ERROR_ACTION, payload);
      expect(error).to.eq(payload);
    });

    it('should allow valid actions through', () => {
      const action: any = { a: 'b' };

      Middleware.errorHandler(<any>{})(null)(next)(action);

      expect(next).to.be.calledWith(action);
    });

    UNDOABLE_ACTIONS.forEach((type) => {
      it(`should handle failed ${type} action`, () => {
        const undoAction = { a: 'b' };
        const payload = { c: 'd' };
        const action = { type, error: true, payload };
        const emit = spy();
        stub(ReduxActionCreators, 'undo').returns(undoAction);

        Middleware.errorHandler(<any>{ emit })(null)(next)(action);

        expect(emit).to.be.calledWith(Events.ERROR_FETCH_ACTION, payload);
        expect(next).to.be.calledWith(undoAction);
      });
    });
  });

  describe('checkPastPurchaseSkus()', () => {
    it('should pass action through if not in PAST_PURCHASE_SKU_ACTIONS', () => {
      const action = { type: 'NOT_ACTUALLY_AN_ACTION' };

      Middleware.checkPastPurchaseSkus(<any>{})(null)(next)(action);

      expect(next).to.be.calledWith(action);
    });

    it('should pass action through if past purchases present', () => {
      const action = { type: PAST_PURCHASE_SKU_ACTIONS[0] };
      const state = { a: 'b' };
      const getState = stub().returns(state);
      const pastPurchases = stub(Selectors, 'pastPurchases').returns([1]);

      Middleware.checkPastPurchaseSkus(<any>{ store: { getState }})(null)(next)(action);

      expect(next).to.be.calledWithExactly(action);
      expect(getState).to.be.calledOnce;
      expect(pastPurchases).to.be.calledWithExactly(state);
    });

    it('should call flux.on if past purchases not present', () => {
      const action = { type: PAST_PURCHASE_SKU_ACTIONS[0] };
      const state = { a: 'b' };
      const conf = { c: 'd' };
      const payload = { e: 'f' };
      const getState = stub().returns(state);
      const once = spy();
      const dispatch = spy();
      const pastPurchases = stub(Selectors, 'pastPurchases').returns([]);
      const config = stub(Selectors, 'config').returns(conf);
      const extract = stub(ConfigurationAdapter, 'extractSecuredPayload').returns(payload);

      Middleware.checkPastPurchaseSkus(<any>{ store: { getState }, once })(
          <any>{ dispatch })(next)(action);
      once.getCall(0).args[1]();

      expect(getState).to.be.calledTwice;
      expect(pastPurchases).to.be.calledWithExactly(state);
      expect(once).to.be.calledWith(Events.PAST_PURCHASE_SKUS_UPDATED);
      expect(dispatch).to.be.calledWithExactly(action);
      expect(config).to.be.calledWithExactly(state);
      expect(extract).to.be.calledWithExactly(conf);
    });

    it('should do nothing if past purchases not present and no secured payload', () => {
      const action = { type: PAST_PURCHASE_SKU_ACTIONS[0] };
      const state = { a: 'b' };
      const conf = { c: 'd' };
      const payload = null;
      const getState = stub().returns(state);
      const once = spy();
      const pastPurchases = stub(Selectors, 'pastPurchases').returns([]);
      const config = stub(Selectors, 'config').returns(conf);
      const extract = stub(ConfigurationAdapter, 'extractSecuredPayload').returns(payload);

      Middleware.checkPastPurchaseSkus(<any>{ store: { getState }, once })(
          <any>{ })(next)(action);

      expect(getState).to.be.calledTwice;
      expect(once).to.not.be.called;
      expect(config).to.be.calledWithExactly(state);
      expect(extract).to.be.calledWithExactly(conf);
    });
  });

  describe('thunkEvaluator()', () => {
    it('should pass forward a plain object action', () => {
      const action = { a: 'b' };

      Middleware.thunkEvaluator(<any>{ getState: () => null })(next)(action);

      expect(next).to.be.calledWithExactly(action);
    });

    it('should evaluate and pass forward a synchonous thunk action', () => {
      const action = { a: 'b' };
      const state = { c: 'd' };
      const thunk = spy(() => action);
      const getState = () => state;

      Middleware.thunkEvaluator(<any>{ getState })(next)(thunk);

      expect(next).to.be.calledWithExactly(action);
      expect(thunk).to.be.calledWithExactly(state);
    });
  });

  describe('arrayMiddleware()', () => {
    it('should pass forward a batch action if the action is an array', () => {
      const actions = [{ type: 'a' }, { type: 'b' }];

      Middleware.arrayMiddleware()(next)(actions);

      expect(next).to.be.calledWith(batchActions(actions));
    });

    it('should pass forward the action if it is not an array', () => {
      const action = { type: 'a' };

      Middleware.arrayMiddleware()(next)(action);

      expect(next).to.be.calledWith(action);
    });
  });

  describe('personalizationAnalyzer()', () => {
    const conf = { a: 1 };
    const state = { b: 2 };

    it('should pass the action forward unchanged if not in list of relevant actions', () => {
      const action = { a: 'b', type: 'NOT_VALID_ACTION' };
      const config = stub(Selectors, 'config').returns(conf);
      const enabled = stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(true);
      const getState = spy(() => state);

      Middleware.personalizationAnalyzer(<any>{ getState })(next)(action);

      expect(next).to.be.calledWithExactly(action);
      expect(config).to.be.calledWithExactly(state);
      expect(enabled).to.be.calledWithExactly(conf);
      expect(getState).to.be.called;
    });

    it('should pass the action forward unchanged if real time biasing disabled', () => {
      const action = { a: 'b', type: PERSONALIZATION_CHANGE_ACTIONS[0] };
      const config = stub(Selectors, 'config').returns(conf);
      const enabled = stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(false);
      const getState = spy(() => state);

      Middleware.personalizationAnalyzer(<any>{ getState })(next)(action);

      expect(next).to.be.calledWithExactly(action);
    });

    it('should pass the action forward if extractBias returns falsy', () => {
      const action = { a: 'b', type: PERSONALIZATION_CHANGE_ACTIONS[0] };
      const returnAction = 'return';
      const extracted = 'extra';
      const config = stub(Selectors, 'config').returns(conf);
      const updateBiasing = stub(ActionCreators, 'updateBiasing').returns(returnAction);
      const extract = stub(PersonalizationAdapter, 'extractBias').returns(null);
      const getState = spy(() => state);
      stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(true);

      Middleware.personalizationAnalyzer(<any>{ getState })(next)(action);

      expect(next).to.be.calledWithExactly(action);
      expect(extract).to.be.calledWithExactly(action, state);
      expect(updateBiasing).to.not.be.called;
    });

    it('should make a batch action if action correct type', () => {
      const action = { a: 'b', type: PERSONALIZATION_CHANGE_ACTIONS[0] };
      const returnAction = 'return';
      const extracted = 'extra';
      const config = stub(Selectors, 'config').returns(conf);
      const updateBiasing = stub(ActionCreators, 'updateBiasing').returns(returnAction);
      const extract = stub(PersonalizationAdapter, 'extractBias').returns(extracted);
      const getState = spy(() => state);
      stub(ConfigurationAdapter, 'isRealTimeBiasEnabled').returns(true);

      Middleware.personalizationAnalyzer(<any>{ getState })(next)(action);

      expect(next).to.be.calledWith([action, returnAction]);
      expect(extract).to.be.calledWithExactly(action, state);
      expect(updateBiasing).to.be.calledWithExactly(extracted);
    });
  });

  describe('saveStateAnalyzer()', () => {
    function sequentiallyCallSaveStateAnalyzer(...callArgs: Array<any[]>) {
      callArgs.forEach(([dispatch, type]) => saveStateAnalyzer(<any>{ dispatch })(() => null)({ type }));
    }

    SAVE_STATE_ACTIONS.forEach((actionName) => {
      it(`should dispatch a SAVE_STATE action on ${actionName}`, () => {
        const dispatch = spy();
        const action = { type: actionName };

        saveStateAnalyzer(<any>{ dispatch })(() => null)(action);

        expect(dispatch).to.be.calledWith({ type: Actions.SAVE_STATE });
      });
    });

    it('should dispatch SAVE_STATE action for the first SAVE_STATE_ACTIONS action in every batch', () => {
      const dispatchToBeCalled = spy();
      const unwantedDispatch = spy();

      sequentiallyCallSaveStateAnalyzer(
        [unwantedDispatch, PUSH],
        [dispatchToBeCalled, SAVE_STATE_ACTIONS[0]],
        [unwantedDispatch, SAVE_STATE_ACTIONS[1]],
        [unwantedDispatch, PUSH],
        [unwantedDispatch, SAVE_STATE_ACTIONS[2]],
        [unwantedDispatch, POP],
        [unwantedDispatch, POP],
        [unwantedDispatch, PUSH],
        [unwantedDispatch, 'noop'],
        [dispatchToBeCalled, SAVE_STATE_ACTIONS[3]],
        [unwantedDispatch, SAVE_STATE_ACTIONS[4]],
        [unwantedDispatch, POP]
      );

      expect(dispatchToBeCalled).to.be.calledTwice.and.calledWith({ type: Actions.SAVE_STATE });
      expect(unwantedDispatch).to.not.be.called;
    });

    it('should dispatch SAVE_STATE action for the first SAVE_STATE_ACTIONS action in a nested batch', () => {
      const dispatchToBeCalled = spy();
      const unwantedDispatch = spy();

      sequentiallyCallSaveStateAnalyzer(
        [unwantedDispatch, PUSH],
        [unwantedDispatch, 'noop'],
        [unwantedDispatch, PUSH],
        [dispatchToBeCalled, SAVE_STATE_ACTIONS[3]],
        [unwantedDispatch, POP],
        [unwantedDispatch, POP]
      );

      expect(dispatchToBeCalled).to.be.calledOnce.and.calledWith({ type: Actions.SAVE_STATE });
      expect(unwantedDispatch).to.not.be.called;
    });

    // tslint:disable-next-line max-line-length
    it('should dispatch SAVE_STATE action for the first SAVE_STATE_ACTIONS action in a batch and for all SAVE_STATE_ACTIONS not in a batch', () => {
      const dispatchToBeCalled = spy();
      const unwantedDispatch = spy();

      sequentiallyCallSaveStateAnalyzer(
        [dispatchToBeCalled, SAVE_STATE_ACTIONS[0]],
        [unwantedDispatch, PUSH],
        [unwantedDispatch, 'noop' ],
        [dispatchToBeCalled, SAVE_STATE_ACTIONS[0]],
        [unwantedDispatch, SAVE_STATE_ACTIONS[1]],
        [unwantedDispatch, POP],
        [dispatchToBeCalled, SAVE_STATE_ACTIONS[0]]
      );

      expect(dispatchToBeCalled).to.have.calledThrice.and.calledWith({ type: Actions.SAVE_STATE });
      expect(unwantedDispatch).to.not.be.called;
    });

    it('should not dispatch SAVE_STATE action', () => {
      const dispatch = spy();

      saveStateAnalyzer(<any>{ dispatch })(() => null)({ type: 'noop' });

      expect(dispatch).to.not.be.called;
    });

    it('should pass the action forward', () => {
      const action = { type: 'test' };

      saveStateAnalyzer(<any>{ dispatch: () => null })(next)(action);

      expect(next).to.be.calledWith(action);
    });
  });
});
