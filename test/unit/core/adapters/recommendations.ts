import ConfigurationAdapter from '../../../../src/core/adapters/configuration';
import RecommendationsAdapter from '../../../../src/core/adapters/recommendations';
import suite from '../../_suite';

suite('Recommendations Adapter', ({ expect, stub }) => {

  describe('buildUrl()', () => {
    it('should build the request URL', () => {
      // tslint:disable-next-line max-line-length
      expect(RecommendationsAdapter.buildUrl('myCustomer', 'a', 'b')).to.eq('https://myCustomer.groupbycloud.com/wisdom/v2/public/recommendations/a/_getb');
    });
  });

  describe('pinNavigations() ', () => {
    it('should pin navigations', () => {
      const results: any = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      const extractNavigationsPinned = stub(ConfigurationAdapter, 'extractNavigationsPinned')
        .returns(['b']);

      expect(RecommendationsAdapter.pinNavigations({ results, config: <any>{} }))
        .to.eql([{ name: 'b' }, { name: 'a' }, { name: 'c' }]);
    });
  });

  describe('pinRefinements() ', () => {
    it('should pin refinements', () => {
      const results: any = [{
        name: 'a',
        refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
      }, {
        name: 'b',
        refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
      }
      ];
      const extractRefinementsPinned = stub(ConfigurationAdapter, 'extractRefinementsPinned')
        .returns({ a: ['2', '3'] });

      expect(RecommendationsAdapter.pinRefinements({ results, config: <any>{} }))
        .to.eql([{
          name: 'a',
          refinements: [{ value: '2' }, { value: '3' }, { value: '1' }]
        },
        {
          name: 'b',
          refinements: [{ value: '1' }, { value: '2' }, { value: '3' }]
        }]);
    });
  });
});
