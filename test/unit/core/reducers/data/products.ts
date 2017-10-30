import { Actions, Store } from '../../../../../src/core';
import products from '../../../../../src/core/reducers/data/products';
import suite from '../../../_suite';

suite('products', ({ expect }) => {
  const state: Store.ProductWithMetadata[] = [
    { id: 1, meta: {}, data: { id: '19232', price: 20, title: 'book' } },
    { id: 2, meta: {}, data: { id: '23942', price: 50, title: 'another book' } },
  ];

  describe('updateProducts()', () => {
    it('should update state on RECEIVE_PRODUCTS', () => {
      const selectedCollection = 'Department';
      const payload = [
        { id: 3, meta: {}, data: { id: '29384', price: 12, title: 'a new book!' } },
        { id: 4, meta: {}, data: { id: '34392', price: 30, title: 'a really interesting another book' } },
      ];

      const reducer = products(state, { type: Actions.RECEIVE_PRODUCT_RECORDS, payload });

      expect(reducer).to.eql(payload);
    });

    it('should update state on RECEIVE_MORE_PRODUCTS', () => {
      const selectedCollection = 'Department';
      const payload = [
        { id: 1, meta: {}, data: { id: '29384', price: 12, title: 'a new book!' } },
        { id: 1, meta: {}, data: { id: '34392', price: 30, title: 'a really interesting another book' } },
      ];

      const reducer = products(state, { type: Actions.RECEIVE_MORE_PRODUCTS, payload });

      expect(reducer).to.eql([...state, ...payload]);
    });

    it('should return state on default', () => {
      const reducer = products(state, <any>{});

      expect(reducer).to.eql(state);
    });
  });
});
