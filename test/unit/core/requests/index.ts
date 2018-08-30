import { Request } from 'groupby-api';
import * as sinon from 'sinon';
import Autocomplete from '../../../../src/core/adapters/autocomplete';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import PastPurchaseAdapter from '../../../../src/core/adapters/past-purchases';
import PersonalizationAdapter from '../../../../src/core/adapters/personalization';
import SearchAdapter, { MAX_RECORDS } from '../../../../src/core/adapters/search';
import RequestBuilder from '../../../../src/core/requests';
import RequestHelpers from '../../../../src/core/requests/utils';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('RequestBuilder', ({ expect, stub, spy }) => {
  let requestBuilder: RequestBuilder;
  let build;
  let override;

  beforeEach(() => {
    build = spy();
    override = spy();
    requestBuilder = new RequestBuilder(build, override);
  });

  describe('constructor()', () => {
    it('should set pastRequest object', () => {
      expect(requestBuilder.pastRequest).to.eql({});
    });

    it('should set _override', () => {
      const state: any = { a: 'b' };
      const config = { c: 'd' };
      stub(Selectors, 'config').withArgs(state).returns(config);

      requestBuilder._override(state);

      expect(override).to.be.calledWithExactly(config);
    });

    it('should set a default function for _override', () => {
      const state: any = { a: 'b' };
      const config = { c: 'd' };
      const builder = new RequestBuilder(build);
      stub(Selectors, 'config').withArgs(state).returns(config);

      const o = builder._override(state)({});

      expect(o).to.eql({});
    });
  });

 describe('override', () => {
   // tslint:disable-next-line max-line-length
   it('should return a function that calls the given override function with the given request and pastRequest key', () => {
     const overrideConfig = spy();
     const req: any = { a: 'b' };
     const pastReq: any = 'search';

     requestBuilder.override(overrideConfig, requestBuilder)(req);

     expect(overrideConfig).to.be.calledWithExactly(req, requestBuilder.pastRequest);
   });
 });

 describe('setPastState()', () => {
   it('should return a function that sets the pastRequest to the given request', () => {
     const pastReq = 'search';
     const req = { a: 'b' };

     const r = requestBuilder.setPastState(requestBuilder)(req);

     expect(r).to.eq(req);
     expect(requestBuilder.pastRequest).to.eq(req);
   });
 });

 describe('composeRequest()', () => {
   it('should combine build, and override, and call setPastState', () => {
     const req = { a: 'b' };
     const overrideFn = () => null;
     const pastStateKey = 'search';
     const normalizedReq = { c: 'd' };
     const oFn = (s) => s;
     const o = () => ({ e: 'f' });
     const setPastState = () => null;
     const state: any = { a: 'b' };
     const overrideRequest = { c: 'd' };
     const requestChain = stub(RequestHelpers, 'chain');
     requestBuilder.build = stub().withArgs(state, overrideRequest).returns(req);
     requestBuilder._override = stub().withArgs(state).returns(oFn);
     requestBuilder.override = stub().withArgs(oFn, requestBuilder).returns(o);
     requestBuilder.setPastState = stub().withArgs(requestBuilder).returns(setPastState);
     stub(utils, 'normalizeToFunction').withArgs(req).returns(normalizedReq);

     requestBuilder.composeRequest(state, overrideRequest);

     expect(requestChain).to.be.calledWithExactly(normalizedReq, o, setPastState);
   });
 });
});
