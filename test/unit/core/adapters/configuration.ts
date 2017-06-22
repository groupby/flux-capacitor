import Adapter from '../../../../src/core/adapters/configuration';
import SearchAdapter from '../../../../src/core/adapters/search';
import { DEFAULT_AREA } from '../../../../src/core/reducers/data/area';
import { DEFAULT_COLLECTION } from '../../../../src/core/reducers/data/collections';
import * as PageReducer from '../../../../src/core/reducers/data/page';
import suite from '../../_suite';

suite('SearchAdapter', ({ expect, stub }) => {
  describe('initialState()', () => {
    it('should return initialState based on defaults', () => {
      const category = 'cat';
      const sort = 'prices';
      const config = <any>{
        autocomplete: {
          category
        },
        search: {
          sort
        }
      };
      expect(Adapter.initialState(config)).to.eql({
        data: {
          area: DEFAULT_AREA,
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: category,
              values: []
            }
          },
          fields: [],
          collections: {
            selected: DEFAULT_COLLECTION,
            allIds: [DEFAULT_COLLECTION],
            byId: {
              [DEFAULT_COLLECTION]: {
                name: DEFAULT_COLLECTION
              }
            }
          },
          sorts: {
            selected: 0,
            items: [sort]
          },
          page: {
            ...PageReducer.DEFAULTS,
            sizes: {
              selected: 0,
              items: [PageReducer.DEFAULT_PAGE_SIZE]
            }
          }
        }
      });
    });
    it('should return initialState based on config', () => {
      const area = 'test';
      const collection = 'All the depts';
      const category = 'whatevs';
      const fields = ['a', 'b', 'c'];
      const pageSize = 50;
      const sort = 'Stuffs';
      const page = {
        ...PageReducer.DEFAULTS,
        sizes: {
          selected: 0,
          items: [pageSize]
        }
      };
      const config = <any>{
        area,
        collection,
        autocomplete: {
          category
        },
        search: {
          fields,
          pageSize,
          sort
        },
      };
      const state = {
        data: {
          area,
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: category,
              values: []
            }
          },
          fields,
          collections: {
            selected: collection,
            allIds: [collection],
            byId: {
              [collection]: {
                name: collection
              }
            }
          },
          sorts: {
            selected: 0,
            items: [sort]
          },
          page
        }
      };
      expect(Adapter.initialState(config)).to.eql(state);
    });
  });
});
