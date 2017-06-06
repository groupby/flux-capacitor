import PageAdapter from '../../../../src/core/adapters/page';
import Adapter from '../../../../src/core/adapters/search';
import suite from '../../_suite';

suite('SearchAdapter', ({ expect, stub }) => {

  describe('extractQuery()', () => {
    it('should convert results to query structure', () => {
      const results: any = {
        correctedQuery: 'apple pie',
        didYouMean: ['a', 'b'],
        relatedQueries: ['c', 'd'],
        rewrites: ['e', 'f'],
      };
      const linkMapper = stub().returns('x');

      const query = Adapter.extractQuery(results, linkMapper);

      expect(query).to.eql({
        corrected: 'apple pie',
        didYouMean: ['x', 'x'],
        related: ['x', 'x'],
        rewrites: ['e', 'f'],
      });
      expect(linkMapper.calledWith('a')).to.be.true;
      expect(linkMapper.calledWith('b')).to.be.true;
      expect(linkMapper.calledWith('c')).to.be.true;
      expect(linkMapper.calledWith('d')).to.be.true;
    });
  });

  describe('extractRefinement()', () => {
    it('should return range refinement', () => {
      const refinement = Adapter.extractRefinement(<any>{
        type: 'Range',
        low: 20,
        high: 30,
        count: 50,
        a: 'b',
        c: 'd',
      });

      expect(refinement).to.eql({ low: 20, high: 30, total: 50 });
    });

    it('should return value refinement', () => {
      const refinement = Adapter.extractRefinement(<any>{
        type: 'Value',
        value: 'Nike',
        count: 23,
        a: 'b',
        c: 'd',
      });

      expect(refinement).to.eql({ value: 'Nike', total: 23 });
    });
  });

  describe('extractNavigationSort()', () => {
    it('should return an equivalent sort object', () => {
      expect(Adapter.extractNavigationSort('Count_Ascending')).to.eql({ field: 'count' });
      expect(Adapter.extractNavigationSort('Count_Descending')).to.eql({ field: 'count', descending: true });
      expect(Adapter.extractNavigationSort('Value_Ascending')).to.eql({ field: 'value' });
      expect(Adapter.extractNavigationSort('Value_Descending')).to.eql({ field: 'value', descending: true });
    });
  });

  describe('extractNavigation()', () => {
    it('should convert navigation to storefront navigation structure', () => {
      const navigation: any = {
        name: 'brand',
        displayName: 'Brand',
        moreRefinements: true,
        or: true,
        refinements: ['a', 'b'],
        sort: { c: 'd' },
      };
      const sort = { e: 'f' };
      const extractRefinement = stub(Adapter, 'extractRefinement').returns('x');
      const extractNavigationSort = stub(Adapter, 'extractNavigationSort').returns(sort);

      const extracted = Adapter.extractNavigation(navigation);

      expect(extracted).to.eql({
        field: 'brand',
        label: 'Brand',
        more: true,
        or: true,
        range: false,
        refinements: ['x', 'x'],
        selected: [],
        sort,
      });
      expect(extractRefinement.calledWith('a')).to.be.true;
      expect(extractRefinement.calledWith('b')).to.be.true;
      expect(extractNavigationSort.calledWith({ c: 'd' })).to.be.true;
    });

    it('should ignore sort if not truthy', () => {
      const navigation: any = { refinements: [] };
      const extractNavigationSort = stub(Adapter, 'extractNavigationSort');

      const extracted = Adapter.extractNavigation(navigation);

      expect(extracted.sort).to.be.undefined;
      expect(extractNavigationSort.called).to.be.false;
    });
  });

  describe('refinementsMatch()', () => {
    it('should match value refinements', () => {
      const lhs: any = { type: 'Value', value: 'blue', a: 'b' };
      const rhs: any = { type: 'Value', value: 'blue', c: 'd' };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.true;
    });

    it('should not match value refinements', () => {
      const lhs: any = { type: 'Value', value: 'blue' };
      const rhs: any = { type: 'Value', value: 'black' };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.false;
    });

    it('should match range refinements', () => {
      const lhs: any = { type: 'Range', low: 20, high: 30, a: 'b' };
      const rhs: any = { type: 'Range', low: 20, high: 30, c: 'd' };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.true;
    });

    it('should not match range refinements', () => {
      const lhs: any = { type: 'Range', low: 20, high: 40 };
      const rhs: any = { type: 'Range', low: 10, high: 30 };

      expect(Adapter.refinementsMatch(lhs, rhs)).to.be.false;
    });
  });

  describe('appendSelectedRefinements()', () => {
    it('should set selected on availble navigation', () => {
      const available: any = { refinements: ['a', 'b', 'c', 'd'] };
      const selected: any = { refinements: ['a', 'd'] };
      const refinementsMatch = stub(Adapter, 'refinementsMatch')
        .callsFake((lhs, rhs) => lhs === rhs);

      Adapter.appendSelectedRefinements(available, selected);

      expect(available.selected).to.eql([0, 3]);
      expect(refinementsMatch.calledWith('a', 'a')).to.be.true;
      expect(refinementsMatch.calledWith('a', 'd')).to.be.true;
      expect(refinementsMatch.calledWith('b', 'd')).to.be.true;
      expect(refinementsMatch.calledWith('c', 'd')).to.be.true;
      expect(refinementsMatch.calledWith('d', 'd')).to.be.true;
    });
  });

  describe('combineNavigations()', () => {
    it('should append selected refinements to available navigation');
  });

  describe('extractZone()', () => {
    it('should extract a content zone', () => {
      const content = 'Canada Day Sale!';
      const name = 'my zone';
      const zone: any = { type: 'Content', name, content };

      expect(Adapter.extractZone(zone)).to.eql({ type: 'content', name, content });
    });

    it('should extract a rich content zone', () => {
      const content = 'Canada Day Sale!';
      const name = 'my zone';
      const zone: any = { type: 'Rich_Content', name, content };

      expect(Adapter.extractZone(zone)).to.eql({ type: 'rich_content', name, content });
    });

    it('should extract a record zone', () => {
      const records = [{ allMeta: { a: 'b' } }, { allMeta: { c: 'd' } }];
      const name = 'my zone';
      const zone: any = { type: 'Records', name, records };

      expect(Adapter.extractZone(zone)).to.eql({
        type: 'record',
        name,
        products: [{ a: 'b' }, { c: 'd' }],
      });
    });
  });

  describe('extractTemplate()', () => {
    it('should convert template structure', () => {
      const template: any = {
        name: 'banner',
        ruleName: 'my rule',
        zones: {
          'zone 1': 'a',
          'zone 2': 'b',
        },
      };
      const extractZone = stub(Adapter, 'extractZone').returns('x');

      expect(Adapter.extractTemplate(template)).to.eql({
        name: 'banner',
        rule: 'my rule',
        zones: {
          'zone 1': 'x',
          'zone 2': 'x',
        },
      });
      expect(extractZone.calledWith('a')).to.be.true;
      expect(extractZone.calledWith('b')).to.be.true;
    });
  });

  describe.skip('extractPage()', () => {
    it('should build page information', () => {
      const store: any = { a: 'b' };
      const pageInfo = { c: 'd' };
      const build = stub(PageAdapter, 'build').returns(pageInfo);

      expect(Adapter.extractPage(store, 10)).to.eql(pageInfo);
      expect(build.called).to.be.true;
    });
  });

  describe('extractProduct()', () => {
    it('should return the allMeta property', () => {
      const allMeta = { a: 'b' };

      expect(Adapter.extractProduct({ allMeta })).to.eq(allMeta);
    });
  });
});
