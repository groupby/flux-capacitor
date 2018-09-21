import Adapter from '../../../../src/core/adapters/request';
import { MAX_RECORDS } from '../../../../src/core/adapters/search';
import suite from '../../_suite';

suite('Request Adapter', ({ expect }) => {
  describe('clampPageSize()', () => {
    it('should return the page size', () => {
      const page = 2;
      const pageSize = 2;

      expect(Adapter.clampPageSize(page, pageSize)).to.eq(pageSize);
    });

    it('should not return a page size that would go past the end of the records', () => {
      const remainingProducts = 2;
      const page = 2;
      const pageSize = MAX_RECORDS - remainingProducts;

      expect(Adapter.clampPageSize(page, pageSize)).to.eq(remainingProducts);
    });
  });

  describe('extractSkip()', () => {
    it('should return skip', () => {
      expect(Adapter.extractSkip(1, 10)).to.eq(0);
      expect(Adapter.extractSkip(2, 10)).to.eq(10);
      expect(Adapter.extractSkip(3, 10)).to.eq(20);
    });
  });

  describe('extractSort()', () => {
    it('should return a descending sort', () => {
      const field = 'height';

      expect(Adapter.extractSort({ field, descending: true })).to.eql({ field, order: 'Descending' });
    });

    it('should return an ascending sort when descending is false', () => {
      const field = 'height';

      expect(Adapter.extractSort({ field, descending: false })).to.eql({ field, order: undefined });
    });

    it('should return an ascending sort', () => {
      const field = 'height';

      expect(Adapter.extractSort({ field })).to.eql({ field, order: undefined });
    });
  });

  describe('extractRefinement()', () => {
    it('should return a value refinement', () => {
      const field = 'Department';
      const refinement: any = { value: 'Shoes' };

      expect(Adapter.extractRefinement(field, refinement))
        .to.eql({ navigationName: field, type: 'Value', value: refinement.value });
    });

    it('should return range refinement', () => {
      const field = 'Department';
      const refinement: any = { high: 10, low: 20 };

      expect(Adapter.extractRefinement(field, refinement))
        .to.eql({ navigationName: field, type: 'Range', high: refinement.high, low: refinement.low });
    });
  });
});
