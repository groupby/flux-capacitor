import * as sinon from 'sinon';
import * as Events from '../../../src/core/events';
import Observer, { DETAIL_QUERY_INDICATOR } from '../../../src/core/observer';
import suite from '../_suite';

suite('Observer', ({ expect, spy, stub }) => {
  describe('listener()', () => {
    it('should return a function that calls listen', () => {
      const store: any = { c: 'd' };
      const flux: any = { x: 'y' };
      const response = { a: 'b' };
      const listener = Observer.listener(flux);
      const listen = stub(Observer, 'listen').returns(response);

      expect(listener(store)).to.eql(response);
      expect(listen).to.be.calledWith(flux, store);
    });
  });

  describe('listen()', () => {
    it('should return a function', () => {
      const store: any = { getState: () => null };
      const observer = Observer.listen(<any>{}, store);

      expect(observer).to.be.a('function');
    });

    it('should call store.getState()', () => {
      const getState = spy();
      const store: any = { getState };
      const observer = Observer.listen(<any>{}, store);

      observer();

      expect(getState).to.be.called;
    });

    it('should call Observer.resolve()', () => {
      const newState = { a: 'b' };
      const flux: any = {};
      const resolve = stub(Observer, 'resolve');
      const create = stub(Observer, 'create');
      const store: any = { getState: () => undefined };
      const observer = Observer.listen(flux, store);
      store.getState = () => newState;

      observer();

      expect(resolve).to.be.calledWith(undefined, newState);
      expect(create).to.be.calledWith(flux);
    });
  });

  describe('resolve()', () => {
    it('should not call the observer if no changes', () => {
      const observer = spy();

      Observer.resolve(undefined, undefined, observer, '');

      expect(observer).to.not.be.called;
    });

    it('should not call the observer if not a function', () => {
      expect(() => Observer.resolve(1, 2, {}, '')).to.not.throw();
    });

    it('should call the observer with the updated node', () => {
      const observer = spy();
      const path = 'my.node.path';

      Observer.resolve(1, 2, (...args) => observer(...args), path);

      expect(observer).to.be.calledWith(1, 2, path);
    });

    it('should call resolve() on subtrees', () => {
      const observer1 = spy();
      const observer2 = spy();
      const observer3 = spy();
      const observer4 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        a: Object.assign((...args) => observer2(...args), {
          x: (...args) => observer3(...args),
        }),
        b: (...args) => observer4(...args),
      });
      const oldState = { a: { x: 1 } };
      const newState = { b: 2 };

      Observer.resolve(oldState, newState, observers, '');

      expect(observer1).to.be.calledWith(oldState, newState);
      expect(observer2).to.be.calledWith({ x: 1 }, undefined);
      expect(observer3).to.be.calledWith(1, undefined);
      expect(observer4).to.be.calledWith(undefined, 2);
    });

    it('should call resolve() when oldState is not defined', () => {
      const observer1 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        b: (...args) => observer1(...args),
      });
      const newState = { b: 2 };

      Observer.resolve(undefined, newState, observers, '');

      expect(observer1).to.be.calledWith(undefined, newState);
    });

    it('should not call resolve() on equal subtrees', () => {
      const observer1 = spy();
      const observer2 = spy();
      const observer3 = spy();
      const observers = Object.assign((...args) => observer1(...args), {
        a: (...args) => observer2(...args),
        b: (...args) => observer3(...args),
      });
      const oldState = {};
      const newState = {};

      Observer.resolve(oldState, newState, observers, '');

      expect(observer1).to.be.calledWith(oldState, newState);
      expect(observer2).to.not.be.called;
      expect(observer3).to.not.be.called;
    });
  });

  describe('terminal()', () => {
    it('should call observer', () => {
      const oldState = { a: 'b' };
      const newState = { c: 'd' };
      const observer = spy();
      const path = '/stuffsidk';

      Observer.terminal(oldState, newState, observer, path);

      expect(observer).to.be.calledWith(oldState, newState, path);
    });

    it('should not call observer when states are equal', () => {
      const state = { a: 'b' };
      const observer = spy();
      const path = '/stuffsidk';

      Observer.terminal(state, state, observer, path);

      expect(observer).to.be.not.be.called;
    });
  });

  describe('indexed()', () => {
    it('should return an observer for each key in newState', () => {
      const oldState = { a: 'b', c: 'f' };
      const newState = { c: 'd', e: 'f' };
      const emit = spy();
      const path = '/stuffsidk';
      const terminal = stub(Observer, 'terminal');
      const indexed = Observer.indexed(emit);

      indexed(oldState, newState, path);

      expect(terminal).to.be.calledWith(oldState['c'], newState['c'], emit, '/stuffsidk.c');
      expect(terminal).to.be.calledWith(oldState['e'], newState['e'], emit, '/stuffsidk.e');
    });
  });

  describe('create()', () => {
    it('should return an observer tree', () => {
      const observers = Observer.create(<any>{});

      expect(observers).to.be.an('object');
      expect(observers.data).to.be.an('object');
      expect(observers.data.autocomplete).to.be.a('function');
      expect(observers.data.collections).to.be.an('object');
      expect(observers.data.collections.byId).to.be.a('function');
      expect(observers.data.collections.selected).to.be.a('function');
      expect(observers.data.details).to.be.an('object');
      expect(observers.data.details.id).to.be.a('function');
      expect(observers.data.details.product).to.be.a('function');
      expect(observers.data.navigations).to.be.a('function');
      // expect(observers.data.navigations[INDEXED]).to.be.a('function');
      expect(observers.data.page).to.be.a('function');
      expect(observers.data.page.current).to.be.a('function');
      expect(observers.data.page.sizes).to.be.a('function');
      expect(observers.data.products).to.be.a('function');
      expect(observers.data.query).to.be.a('function');
      expect(observers.data.query.corrected).to.be.a('function');
      expect(observers.data.query.didYouMean).to.be.a('function');
      expect(observers.data.query.original).to.be.a('function');
      expect(observers.data.query.related).to.be.a('function');
      expect(observers.data.query.rewrites).to.be.a('function');
      expect(observers.data.reditect).to.be.a('function');
      expect(observers.data.sorts).to.be.a('function');
      expect(observers.data.template).to.be.a('function');
    });

    describe('data', () => {
      let emit;
      let observers;
      const path = '.search.whatever.stuff';

      beforeEach(() => {
        emit = spy();
        observers = Observer.create(<any>{ emit });
      });

      describe('autocomplete()', () => {
        it('should emit AUTOCOMPLETE_SUGGESTIONS_UPDATED event when suggestions differ', () => {
          const oldState = { suggestions: 'idk' };
          const newState = { suggestions: 'im different o wow' };

          observers.data.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED);
        });

        it('should emit AUTOCOMPLETE_SUGGESTIONS_UPDATED event when categories differ', () => {
          const oldState = { category: 'idk' };
          const newState = { category: 'im different o wow' };

          observers.data.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED);
        });

        it('should emit AUTOCOMPLETE_SUGGESTIONS_UPDATED event when navigations differ', () => {
          const oldState = { navigations: 'idk' };
          const newState = { navigations: 'im different o wow' };

          observers.data.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_SUGGESTIONS_UPDATED);
        });

        it('should emit AUTOCOMPLETE_QUERY_UPDATED event when queries differ', () => {
          const oldState = { query: 'idk' };
          const newState = { query: 'im different o wow' };

          observers.data.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_QUERY_UPDATED);
        });

        it('should emit AUTOCOMPLETE_PRODUCTS_UPDATED event when queries differ', () => {
          const oldState = { products: 'idk' };
          const newState = { products: 'im different o wow' };

          observers.data.autocomplete(oldState, newState, path);

          expect(emit).to.be.calledWith(Events.AUTOCOMPLETE_PRODUCTS_UPDATED);
        });
      });

      describe('collections', () => {
        it('should emit COLLECTION_UPDATED event', () => {
          const indexed = stub(Observer, 'indexed').returns('eyy');
          observers = Observer.create(<any>{ emit });
          const byId = observers.data.collections.byId;

          expect(byId).to.eq('eyy');
          expect(indexed).to.be.calledWith(sinon.match.func);
        });

        it('should emit SELECTED_COLLECTION_UPDATED event', () => {
          observers.data.collections.selected();

          expect(emit).to.be.calledWith(Events.SELECTED_COLLECTION_UPDATED);
        });
      });

      describe('details', () => {
        it('should emit DETAILS_ID_UPDATED event', () => {
          observers.data.details.id();

          expect(emit).to.be.calledWith(Events.DETAILS_ID_UPDATED);
        });

        it('should emit DETAILS_PRODUCT_UPDATED event', () => {
          observers.data.details.product();

          expect(emit).to.be.calledWith(Events.DETAILS_PRODUCT_UPDATED);
        });
      });

      // TODO: fix these
      describe('navigations', () => {
        it.skip('should emit SELECTED_REFINEMENTS_UPDATED event', () => {
          observers.data.navigations.bydId.brand.selected(undefined, OBJ);

          expect(emit).to.be.calledWith(`${Events.SELECTED_REFINEMENTS_UPDATED}:brand`, OBJ);
        });
      });

      describe('page', () => {
        it('should emit PAGE_UPDATED event', () => {
          observers.data.page(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.PAGE_UPDATED, OBJ);
        });

        it('should emit CURRENT_PAGE_UPDATED event', () => {
          observers.data.page.current(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.CURRENT_PAGE_UPDATED, OBJ);
        });

        it('should emit PAGE_SIZE_UPDATED event', () => {
          observers.data.page.sizes(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.PAGE_SIZE_UPDATED, OBJ);
        });
      });

      describe.skip('products', () => {
        it('should emit PRODUCTS_UPDATED event', () => {
          observers.data.products(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.PRODUCTS_UPDATED, OBJ);
        });
      });

      describe('query', () => {
        it('should emit QUERY_UPDATED event', () => {
          observers.data.query(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.QUERY_UPDATED, OBJ);
        });

        it('should emit CORRECTED_QUERY_UPDATED event', () => {
          observers.data.query.corrected(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.CORRECTED_QUERY_UPDATED, OBJ);
        });

        it('should emit DID_YOU_MEANS_UPDATED event', () => {
          observers.data.query.didYouMean(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.DID_YOU_MEANS_UPDATED, OBJ);
        });

        it('should emit ORIGINAL_QUERY_UPDATED event', () => {
          observers.data.query.original(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.ORIGINAL_QUERY_UPDATED, OBJ);
        });

        it('should emit RELATED_QUERIES_UPDATED event', () => {
          observers.data.query.related(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.RELATED_QUERIES_UPDATED, OBJ);
        });

        it('should emit QUERY_REWRITES_UPDATED event', () => {
          observers.data.query.rewrites(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.QUERY_REWRITES_UPDATED, OBJ);
        });
      });

      describe('reditect', () => {
        it('should emit REDIRECT event', () => {
          observers.data.reditect(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.REDIRECT, OBJ);
        });
      });

      describe('sorts', () => {
        it('should emit SORTS_UPDATED event', () => {
          observers.data.sorts(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.SORTS_UPDATED, OBJ);
        });
      });

      describe('template', () => {
        it('should emit TEMPLATE_UPDATED event', () => {
          observers.data.template(undefined, OBJ);

          expect(emit).to.be.calledWith(Events.TEMPLATE_UPDATED, OBJ);
        });
      });
    });
  });
});
