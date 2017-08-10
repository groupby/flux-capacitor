import Adapter from '../../../../src/core/adapters/autocomplete';
import ConfigAdapter from '../../../../src/core/adapters/configuration';
import SearchAdapter from '../../../../src/core/adapters/search';
import suite from '../../_suite';

suite('Autocomplete Adapter', ({ expect, stub }) => {

  describe('extractSuggestions()', () => {
    it('should remap search term values', () => {
      const response = { result: { searchTerms: [{ value: 'a' }, { value: 'b', test: 'ignore me' }] } };

      const { suggestions } = Adapter.extractSuggestions(response, '');

      expect(suggestions).to.eql([{ value: 'a' }, { value: 'b' }]);
    });

    it('should extract category values', () => {
      const brand = { a: 'b' };
      const values = ['x', 'y'];
      const searchTerm = { value: 'a', additionalInfo: { brand } };
      const response = { result: { searchTerms: [searchTerm] } };
      const extractCategoryValues = stub(Adapter, 'extractCategoryValues').returns(values);

      const { categoryValues } = Adapter.extractSuggestions(response, 'brand');

      expect(categoryValues).to.eq(values);
      expect(extractCategoryValues).to.be.calledWith(searchTerm);
    });

    it('should should ignore category if not specified', () => {
      const response = { result: { searchTerms: [{}] } };
      const extractCategoryValues = stub(Adapter, 'extractCategoryValues');

      Adapter.extractSuggestions(response, '');

      expect(extractCategoryValues.called).to.be.false;
    });

    it('should should ignore category if no search terms', () => {
      const response = { result: { searchTerms: [] } };
      const extractCategoryValues = stub(Adapter, 'extractCategoryValues');

      Adapter.extractSuggestions(response, 'brand');

      expect(extractCategoryValues.called).to.be.false;
    });
  });

  describe('extractCategoryValues()', () => {
    it('should return an array of category values', () => {
      const brand = ['a', 'b'];

      const values = Adapter.extractCategoryValues({ additionalInfo: { brand } }, 'brand');

      expect(values).to.eq(brand);
    });

    it('should default to empty array', () => {
      const values = Adapter.extractCategoryValues({ additionalInfo: {} }, 'brand');

      expect(values).to.eql([]);
    });
  });

  describe('extractProducts()', () => {
    it('should call extractProduct()', () => {
      const extractProduct = stub(SearchAdapter, 'extractProduct').returns('x');

      const products = Adapter.extractProducts({ result: { products: ['a', 'b'] } });

      expect(products).to.eql(['x', 'x']);
      expect(extractProduct).to.be.calledWith('a');
      expect(extractProduct).to.be.calledWith('b');
    });
  });

  describe('extractArea()', () => {
    const area = 'myArea';

    it('should call extractAutocompleteArea()', () => {
      const config: any = { a: 'b' };
      const extractAutocompleteArea = stub(ConfigAdapter, 'extractAutocompleteArea').returns(area);

      expect(Adapter.extractArea(config)).to.eq(area);

      expect(extractAutocompleteArea).to.be.calledWith(config);
    });

    it('should fall back to global area', () => {
      const config: any = { a: 'b' };
      const extractArea = stub(ConfigAdapter, 'extractArea').returns(area);
      stub(ConfigAdapter, 'extractAutocompleteArea');

      expect(Adapter.extractArea(config)).to.eq(area);

      expect(extractArea).to.be.calledWith(config);
    });
  });

  describe('extractProductArea()', () => {
    const area = 'myArea';

    it('should call extractAutocompleteProductArea()', () => {
      const config: any = { a: 'b' };
      const extractAutocompleteProductArea = stub(ConfigAdapter, 'extractAutocompleteProductArea')
        .returns(area);

      expect(Adapter.extractProductArea(config)).to.eq(area);

      expect(extractAutocompleteProductArea).to.be.calledWith(config);
    });

    it('should fall back to autocomplete area', () => {
      const config: any = { a: 'b' };
      const extractArea = stub(Adapter, 'extractArea').returns(area);
      stub(ConfigAdapter, 'extractAutocompleteProductArea');

      expect(Adapter.extractProductArea(config)).to.eq(area);

      expect(extractArea).to.be.calledWith(config);
    });
  });

  describe('extractLanguage()', () => {
    const language = 'en';

    it('should call extractAutocompleteLanguage()', () => {
      const config: any = { a: 'b' };
      const extractAutocompleteLanguage = stub(ConfigAdapter, 'extractAutocompleteLanguage').returns(language);

      expect(Adapter.extractLanguage(config)).to.eq(language);

      expect(extractAutocompleteLanguage).to.be.calledWith(config);
    });

    it('should fall back to global language', () => {
      const config: any = { a: 'b' };
      const extractLanguage = stub(ConfigAdapter, 'extractLanguage').returns(language);
      stub(ConfigAdapter, 'extractAutocompleteLanguage');

      expect(Adapter.extractLanguage(config)).to.eq(language);

      expect(extractLanguage).to.be.calledWith(config);
    });
  });

  describe('extractProductLanguage()', () => {
    const language = 'en';

    it('should call extractAutocompleteProductLanguage()', () => {
      const config: any = { a: 'b' };
      const extractAutocompleteProductLanguage = stub(ConfigAdapter, 'extractAutocompleteProductLanguage')
        .returns(language);

      expect(Adapter.extractProductLanguage(config)).to.eq(language);

      expect(extractAutocompleteProductLanguage).to.be.calledWith(config);
    });

    it('should fall back to autocomplete language', () => {
      const config: any = { a: 'b' };
      const extractLanguage = stub(Adapter, 'extractLanguage').returns(language);
      stub(ConfigAdapter, 'extractAutocompleteProductLanguage');

      expect(Adapter.extractProductLanguage(config)).to.eq(language);

      expect(extractLanguage).to.be.calledWith(config);
    });
  });

  describe('mergeSuggestions()', () => {
    it('should return an array of recommendations and suggestions', () => {
      const suggestions = [{ value: 'a' }, { value: 'b' }];
      const recommendations = <any>{ result: [{ query: 'test' }, { query: 'idk' }] };
      const result = [{ value: 'test', trending: true }, { value: 'idk', trending: true }, ...suggestions];
      expect(Adapter.mergeSuggestions(suggestions, recommendations)).to.eql(result);
    });
  });
});
