import * as effects from 'redux-saga/effects';
import { ActionCreators } from 'redux-undo';
import Actions from '../../../../src/core/actions';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import * as Events from '../../../../src/core/events';
import Requests from '../../../../src/core/requests';
import { Tasks as productDetailsTasks } from '../../../../src/core/sagas/product-details';
import sagaCreator, { Tasks } from '../../../../src/core/sagas/products';
import Selectors from '../../../../src/core/selectors';
import * as utils from '../../../../src/core/utils';
import suite from '../../_suite';

suite('products saga', ({ expect, spy, stub }) => {

  describe('createSaga()', () => {
    it('should return a saga', () => {
      const flux: any = { a: 'b' };

      const saga = sagaCreator(flux)();

      // tslint:disable-next-line max-line-length
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_PRODUCTS, Tasks.fetchProductsAndNavigations, flux));
      expect(saga.next().value).to.eql(effects.takeLatest(Actions.FETCH_MORE_PRODUCTS, Tasks.fetchMoreProducts, flux));
      saga.next();
    });
  });

  describe('Tasks', () => {
    describe('fetchProductsAndNavigations()', () => {
      it('should fetch products and navigations', () => {
        const id = '1459';
        const config: any = { e: 'f', search: { redirectSingleResult: false } };
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const payload = { a: 'b' };
        const action: any = { payload };
        const receiveProductsAction: any = { c: 'd' };
        const receiveNavigationsAction: any = { e: 'f' };
        const request = { e: 'f' };
        const response = { id, totalRecordCount: 3 };
        const receiveProducts = spy(() => receiveProductsAction);
        const receiveRecommendationsNavigations = spy(() => receiveNavigationsAction);
        // tslint:disable-next-line max-line-length
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts, receiveRecommendationsNavigations }, config };

        const task = Tasks.fetchProductsAndNavigations(flux, action);

        expect(task.next().value).to.eql(effects.all(([
          effects.call(Tasks.fetchProducts, flux, action),
          effects.call(Tasks.fetchNavigations, flux, action)
        ])));
        expect(task.next([response, undefined]).value).to.eql(effects.put(receiveProductsAction));
        // expect(task.next().value).to.eql(effects.put(receiveNavigationsAction));
        expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        expect(receiveProducts).to.be.calledWithExactly(response);
        task.next();
        expect(saveState).to.be.calledWith(utils.Routes.SEARCH);
      });

      it('should call actions.receiveRedirect when products.redirect is true', () => {
        const receiveProductsAction: any = { c: 'd' };
        const receiveNavigationsAction: any = { e: 'f' };
        const receiveRedirect = spy(() => receiveProductsAction);
        const receiveProducts = spy(() => receiveNavigationsAction);
        const flux = { actions: { receiveProducts, receiveRedirect },
          config: {
            search: {
              redirectSingleResult: false
            }
          },
          emit: () => undefined,
          saveState: () => undefined
        };

        let task = Tasks.fetchProductsAndNavigations(<any> flux, <any>{ hello: 'hello' });
        task.next();
        task.next([{ redirect: true }, undefined]);
        task.next();
        expect(receiveRedirect).to.be.calledOnce;
      });
    });

    describe('fetchProducts()', () => {
      it('should return products', () => {
        const id = '1459';
        const config: any = { e: 'f', search: { redirectSingleResult: false } };
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const payload = { a: 'b' };
        const action: any = { payload };
        const receiveProductsAction: any = { c: 'd' };
        const request = { e: 'f' };
        const response = { id, totalRecordCount: 3 };
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts }, config };

        const task = Tasks.fetchProducts(flux, action);

        expect(task.next().value).to.eql(effects.select(Requests.search, config));
        const ret = effects.call([bridge, search], request);
        expect(task.next(request).value).to.eql(ret);
        expect(task.next(request).value).to.eql(request);
        // expect(task.next(response).value).to.eql(effects.put(receiveProductsAction));
        // expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        // expect(receiveProducts).to.be.calledWithExactly(response);

        // task.next();
        // expect(saveState).to.be.calledWith(utils.Routes.SEARCH);
      });

      // it('should call receiveDetailsProduct if redirectSingleResult true and single record', () => {
      //   const id = '1459';
      //   const config: any = { e: 'f', search: { redirectSingleResult: true } };
      //   const emit = spy();
      //   const saveState = spy();
      //   const search = () => null;
      //   const bridge = { search };
      //   const payload = { a: 'b' };
      //   const action: any = { payload };
      //   const receiveProductsAction: any = { c: 'd' };
      //   const request = { e: 'f' };
      //   const response = { id, totalRecordCount: 1, records: [{}] };
      //   const receiveProducts = spy(() => receiveProductsAction);
      //   const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveProducts }, config };

      //   const task = Tasks.fetchProducts(flux, action);

      //   task.next();
      //   task.next();

      //   expect(task.next(response).value).to.eql(
      //     effects.call(productDetailsTasks.receiveDetailsProduct, flux, response.records[0])
      //   );
      // });

      // it('should handle redirect', () => {
      //   const redirect = '/somewhere.html';
      //   const payload = { a: 'b' };
      //   const receiveRedirectAction: any = { g: 'h' };
      //   const receiveRedirect = spy(() => receiveRedirectAction);
      //   const flux: any = {
      //     clients: { bridge: { search: () => null } },
      //     actions: { receiveRedirect, receiveProducts: () => ({}) }
      //   };

      //   const task = Tasks.fetchProducts(flux, <any>{ payload });

      //   task.next().value;
      //   task.next().value;
      //   expect(task.next({ redirect }).value).to.eql(effects.put(receiveRedirectAction));
      //   expect(receiveRedirect).to.be.calledWith(redirect);
      //   task.next();
      // });

      it('should handle request failure', () => {
        const error = new Error();
        const receiveProductsAction: any = { a: 'b' };
        const receiveProducts = spy(() => receiveProductsAction);
        const flux: any = {
          emit: () => null,
          saveState: () => null,
          clients: { bridge: { search: () => null } },
          actions: { receiveProducts }
        };

        const task = Tasks.fetchProducts(flux, <any>{});

        expect(task.throw(error)).to.throw;
      });
    });

    describe('fetchMoreProducts()', () => {
      it('should return more products', () => {
        const id = '41892';
        const pageSize = 14;
        const emit = spy();
        const saveState = spy();
        const search = () => null;
        const bridge = { search };
        const action: any = { payload: pageSize };
        const receiveMoreProductsAction: any = { c: 'd' };
        const receiveMoreProducts = spy(() => receiveMoreProductsAction);
        const state = { e: 'f' };
        const records = ['g', 'h'];
        const results = { records, id };
        const flux: any = { emit, saveState, clients: { bridge }, actions: { receiveMoreProducts } };
        stub(Requests, 'search').returns({ e: 'f' });
        stub(Selectors, 'products').returns(['a', 'b', 'c']);

        const task = Tasks.fetchMoreProducts(flux, action);

        expect(task.next().value).to.eql(effects.select());
        expect(task.next(state).value).to.eql(effects.call([bridge, search], {
          e: 'f',
          pageSize,
          skip: 3
        }));
        expect(task.next(results).value).to.eql(effects.put(receiveMoreProductsAction));
        expect(receiveMoreProducts).to.be.calledWithExactly(records);
        expect(emit).to.be.calledWithExactly(Events.BEACON_SEARCH, id);
        task.next();
      });

      it('should throw error on failure', () => {
        const error = new Error();
        const receiveMoreProductsAction: any = { a: 'b' };
        const receiveMoreProducts = spy(() => receiveMoreProductsAction);
        const flux: any = {
          clients: { sayt: { productSearch: () => null } },
          actions: { receiveMoreProducts }
        };

        const task = Tasks.fetchMoreProducts(flux, <any>{});

        task.next();
        expect(task.throw(error).value).to.eql(effects.put(receiveMoreProductsAction));
        expect(receiveMoreProducts).to.be.calledWith(error);
        task.next();
      });
    });
    describe('fetchNavigations()', () => {
      it('should return two actions', () => {
        const customerId = 'id';
        const flux: any = {
          config: {
            customerId,
            recommendations: {
              iNav: {
                navigations: {
                  sort: true
                },
                refinements: {
                  sort: true
                }
              }
            },
          },
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = {
          sortNavigations: true,
          sortRefinements: true,
          refinements: [{ values: 'truthy' }, { values: 'literally truthy' }]
        };
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });

        expect(task.next().value).to.eql(effects.call(fetch, url, body));
        expect(buildUrl).to.be.calledWith(customerId, 'refinements', 'Popular');
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(buildBody).to.be.calledWith({
          size: 10,
          window: 'day',
        });
        expect(task.next(recommendations).value).to.eql(returnVal);
        task.next();
      });
      it('should call receive navigations only when refinements sort is false', () => {
        const customerId = 'id';
        const flux: any = {
          config: {
            customerId,
            recommendations: {
              iNav: {
                navigations: {
                  sort: true
                },
                refinements: {
                  sort: false
                }
              }
            },
          },
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = {
          sortNavigations: true,
          sortRefinements: false,
          refinements: [{ values: 'truthy' }, { values: 'literally truthy' }]
        };
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });

        expect(task.next().value).to.eql(effects.call(fetch, url, body));
        expect(buildUrl).to.be.calledWith(customerId, 'refinements', 'Popular');
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(buildBody).to.be.calledWith({
          size: 10,
          window: 'day',
        });
        expect(task.next(recommendations).value).to.eql(returnVal);
        task.next();
      });
      it('should only call receive refinements action when navigations sort is off', () => {
        const customerId = 'id';
        const flux: any = {
          config: {
            customerId,
            recommendations: {
              iNav: {
                navigations: {
                  sort: false
                },
                refinements: {
                  sort: true
                }
              }
            },
          },
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = {
          sortNavigations: false,
          sortRefinements: true,
          refinements: [{ values: 'truthy' }, { values: 'literally truthy' }]
        };
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });

        expect(task.next().value).to.eql(effects.call(fetch, url, body));
        expect(buildUrl).to.be.calledWith(customerId, 'refinements', 'Popular');
        expect(task.next({ json: () => jsonResult }).value).to.eql(jsonResult);
        expect(buildBody).to.be.calledWith({
          size: 10,
          window: 'day',
        });
        expect(task.next(recommendations).value).to.eql(returnVal);
      });
      it('should not call any actions when both navigations and refinements sort are off', () => {
        const receiveRecommendationsNavigations = spy((val) => val);
        const receiveRecommendationsRefinements = spy((val) => val);
        const customerId = 'id';
        const flux: any = {
          config: {
            customerId,
            recommendations: {
              iNav: {
                navigations: {
                  sort: false
                },
                refinements: {
                  sort: false
                }
              }
            },
          },
          actions: {
            receiveRecommendationsNavigations,
            receiveRecommendationsRefinements
          }
        };
        const url = 'url';
        const body = { a: 'b' };
        const recommendations = {
          result: [{ values: 'truthy' }, { values: false }, { values: 'literally truthy' }]
        };
        const returnVal: any = [{ values: 'truthy' }, { values: 'literally truthy' }];
        const jsonResult = 'hello';

        const buildUrl = stub(RecommendationsAdapter, 'buildUrl').returns(url);
        const buildBody = stub(RecommendationsAdapter, 'buildBody').returns(body);
        const fetch = stub(utils, 'fetch');
        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });

        task.next();
        expect(receiveRecommendationsRefinements).to.not.be.called;
        expect(receiveRecommendationsNavigations).to.not.be.called;
        task.next();
      });

      it('should return error on failure', () => {
        const error = new Error();
        const receiveRecommendationsNavigationsAction: any = { a: 'b' };
        const receiveRecommendationsRefinementsAction: any = { a: 'b' };
        const receiveRecommendationsNavigations = spy(() => receiveRecommendationsNavigationsAction);
        const receiveRecommendationsRefinements = spy(() => receiveRecommendationsRefinementsAction);
        const flux: any = {
          config: {
            recommendations: {
              iNav: {
                navigations: {
                  sort: true
                },
                refinements: {
                  sort: true
                }
              }
            },
          }, actions: {
            receiveRecommendationsNavigations, receiveRecommendationsRefinements
          }
        };

        const task = Tasks.fetchNavigations(flux, <any>{ payload: {} });
        task.next();
        expect(task.throw(error).value).to.eq(error);
      });
    });
  });
});
