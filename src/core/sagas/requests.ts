import { BridgeCallback, Request } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import { QueryTimeAutocompleteConfig, SearchCallback } from 'sayt';
import FluxCapacitor from '../../flux-capacitor';
import Actions from '../actions';
import PastPurchasesAdapter from '../adapters/past-purchases';
import RecommendationsAdapter from '../adapters/recommendations';
import Events from '../events';
import RequestHelpers from '../requests/utils';
import Selectors from '../selectors';
import Store from '../store';
import { fetch } from '../utils';

namespace Requests {
  export function* search(flux: FluxCapacitor, request: Request, cb?: BridgeCallback) {
    return yield effects.call([flux.clients.bridge, flux.clients.bridge.search], request, cb);
  }

  // tslint:disable-next-line max-line-length
  export function* autocomplete(flux: FluxCapacitor, query: string, config: QueryTimeAutocompleteConfig, cb?: SearchCallback) {
    return yield effects.call([flux.clients.sayt, flux.clients.sayt.autocomplete], query, config, cb);
  }

  export function* refinements(flux: FluxCapacitor, request: Request, navigationName: string, cb?: BridgeCallback) {
    return yield effects.call([flux.clients.bridge, flux.clients.bridge.refinements], request, navigationName, cb);
  }

  // tslint:disable-next-line max-line-length
  export function* recommendations({ customerId, endpoint, mode, body }: { customerId: string, endpoint: string, mode: string, body: RequestHelpers.RequestBody }, cb?: (err: any, result: any) => void) {
    return yield effects.call(
      fetch,
      RecommendationsAdapter.buildUrl(customerId, endpoint, mode),
      RequestHelpers.buildPostBody(body),
      cb
    );
  }

  // tslint:disable-next-line max-line-length
  export function* pastPurchases({ customerId, endpoint, body }: { customerId: string, endpoint: string, body: RequestHelpers.RequestBody }, cb?: (err: any, result: any) => void) {
    return yield effects.call(
      fetch,
      PastPurchasesAdapter.buildUrl(customerId, endpoint),
      RequestHelpers.buildPostBody(body),
      cb
    );
  }
}

export default Requests;
