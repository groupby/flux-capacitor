import * as effects from 'redux-saga/effects';
import * as sinon from 'sinon';
import Actions from '../../../../src/core/actions';
import PastPurchasesAdapter from '../../../../src/core/adapters/past-purchases';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import Events from '../../../../src/core/events';
import RequestHelpers from '../../../../src/core/requests/utils';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/product-details';
import Requests from '../../../../src/core/sagas/requests';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('requests saga', ({ expect, spy, stub }) => {

  describe('Requests', () => {
    describe('search()', () => {
      it('should call bridge and search with the request and callback', () => {
        const flux: any = { clients: { bridge: { search: () => null } } };
        const request: any = { a: 'b' };
        const callback = spy();

        const task = Requests.search(flux, request, callback);

        expect(task.next().value)
          .to.eql(effects.call([flux.clients.bridge, flux.clients.bridge.search], request, callback));
      });
    });

    describe('autocomplete()', () => {
      it('should call sayt and autocomplete with query, config and callback', () => {
        const flux: any = { clients: { sayt: { autocomplete: () => null } } };
        const query = 'dress';
        const config: any = { a: 'b' };
        const callback = spy();

        const task = Requests.autocomplete(flux, query, config, callback);

        expect(task.next().value)
          .to.eql(effects.call([flux.clients.sayt, flux.clients.sayt.autocomplete], query, config, callback));
      });
    });

    describe('refinements()', () => {
      it('should call bridge and refinements with request, navigationName and callback', () => {
        const flux: any = { clients: { bridge: { refinements: () => null } } };
        const request: any = { a: 'b' };
        const navigationName = 'department';
        const callback = spy();

        const task = Requests.refinements(flux, request, navigationName, callback);

        expect(task.next().value)
          .to.eql(effects.call(
            [flux.clients.bridge, flux.clients.bridge.refinements],
            request,
            navigationName,
            callback
          ));
      });
    });

    describe('recommendations()', () => {
      it('call fetch with url, request and callback', () => {
        const customerId = 'storefront';
        const endpoint = 'recommendations';
        const mode = 'popular';
        const body: any = { a: 'b' };
        const callback = spy();
        const requestBody = {
          customerId,
          endpoint,
          mode,
          body
        };
        const url = 'www.google.ca';
        const resultingBody: any = { c: 'd' };
        const fetch = stub(utils, 'fetch');
        stub(RecommendationsAdapter, 'buildUrl').withArgs(customerId, endpoint, mode).returns(url);
        stub(RequestHelpers, 'buildPostBody').withArgs(body).returns(resultingBody);

        const task = Requests.recommendations(requestBody, callback);

        expect(task.next().value)
          .to.eql(effects.call(fetch, url, resultingBody, callback));
      });
    });

    describe('pastPurchases()', () => {
      it('call fetch with url, request and callback', () => {
        const customerId = 'storefront';
        const endpoint = 'recommendations';
        const mode = 'popular';
        const body: any = { a: 'b' };
        const callback = spy();
        const requestBody = {
          customerId,
          endpoint,
          body
        };
        const url = 'www.reddit.com';
        const resultingBody: any = { c: 'd' };
        const fetch = stub(utils, 'fetch');
        stub(PastPurchasesAdapter, 'buildUrl').withArgs(customerId, endpoint).returns(url);
        stub(RequestHelpers, 'buildPostBody').withArgs(body).returns(resultingBody);

        const task = Requests.pastPurchases(requestBody, callback);

        expect(task.next().value)
          .to.eql(effects.call(fetch, url, resultingBody, callback));
      });
    });
  });
});
