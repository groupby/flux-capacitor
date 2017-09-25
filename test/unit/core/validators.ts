import Selectors from '../../../src/core/selectors';
import * as validators from '../../../src/core/validators';
import suite from '../_suite';

suite('validators', ({ expect, spy, stub }) => {

  describe('isString', () => {
    const validator = validators.isString;

    it('should be valid if value is a string', () => {
      expect(validator.func('test')).to.be.true;
    });

    it('should be invalid if value is an empty string', () => {
      expect(validator.func('')).to.be.false;
      expect(validator.func(' ')).to.be.false;
      expect(validator.func(<any>false)).to.be.false;
    });
  });

  describe('isValidQuery', () => {
    it('should use isString validator', () => {
      const query = 'rambo';
      const isString = stub(validators.isString, 'func').returns(true);

      expect(validators.isValidQuery.func(query)).to.be.true;
      expect(isString).to.be.calledWithExactly(query);
    });

    it('should be valid if null', () => {
      expect(validators.isValidQuery.func(null)).to.be.true;
    });
  });

  describe('isDifferentQuery', () => {
    const query = 'rambo';

    it('should be valid if query will change', () => {
      stub(Selectors, 'query').returns('shark');

      expect(validators.isDifferentQuery.func(query)).to.be.true;
    });

    it('should be invalid if query will not change', () => {
      stub(Selectors, 'query').returns(query);

      expect(validators.isDifferentQuery.func(query)).to.be.false;
    });
  });

  describe('isValidClearField', () => {
    it('should use isString validator', () => {
      const field = 'brand';
      const isString = stub(validators.isString, 'func').returns(true);

      expect(validators.isValidClearField.func(field)).to.be.true;
      expect(isString).to.be.calledWithExactly(field);
    });

    it('should be valid if true', () => {
      expect(validators.isValidClearField.func(true)).to.be.true;
    });

    it('should be invalid if falsey', () => {
      expect(validators.isValidClearField.func()).to.be.false;
      expect(validators.isValidClearField.func(undefined)).to.be.false;
      expect(validators.isValidClearField.func(null)).to.be.false;
    });
  });

  describe('hasSelectedRefinements', () => {
    it('should be valid if existing selected refinements', () => {
      stub(Selectors, 'selectedRefinements').returns(['a']);

      expect(validators.hasSelectedRefinements.func()).to.be.true;
    });

    it('should be invalid if no existing selected refinements', () => {
      stub(Selectors, 'selectedRefinements').returns([]);

      expect(validators.hasSelectedRefinements.func()).to.be.false;
    });
  });

  describe('hasSelectedRefinementsByField', () => {
    it('should be valid if existing selected refinements for field', () => {
      const field = 'size';
      const state: any = { a: 'b' };
      const navigation = stub(Selectors, 'navigation').returns({ selected: ['a'] });

      expect(validators.hasSelectedRefinementsByField.func(field, state)).to.be.true;
      expect(navigation).to.be.calledWithExactly(state, field);
    });

    it('should be invalid if no existing selected refinements for field', () => {
      stub(Selectors, 'navigation').returns({ selected: [] });

      expect(validators.hasSelectedRefinementsByField.func()).to.be.false;
    });
  });

  describe('notOnFirstPage', () => {
    it('should be valid if current page is not 1', () => {
      stub(Selectors, 'page').returns(9);

      expect(validators.notOnFirstPage.func()).to.be.true;
    });

    it('should be invalid if current page is 1', () => {
      stub(Selectors, 'page').returns(1);

      expect(validators.notOnFirstPage.func()).to.be.false;
    });
  });

  describe('isRangeRefinement', () => {
    it('should be valid if low and high are numeric', () => {
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: 20, high: 40 })).to.be.true;
    });

    it('should be valid if not a range refinement', () => {
      expect(validators.isRangeRefinement.func(<any>{ range: false })).to.be.true;
    });

    it('should be invalid if low or high are non-numeric', () => {
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: 20, high: true })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: '3', high: 31 })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true, low: 2 })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true, high: 2 })).to.be.false;
      expect(validators.isRangeRefinement.func(<any>{ range: true })).to.be.false;
    });
  });

  describe('isValidRange', () => {
    it('should be valid if low value is lower than high value', () => {
      expect(validators.isValidRange.func(<any>{ range: true, low: 30, high: 40 })).to.be.true;
      expect(validators.isValidRange.func(<any>{ range: true, low: 30, high: 40 })).to.be.true;
    });

    it('should be valid if not range refinement', () => {
      expect(validators.isValidRange.func(<any>{ range: false })).to.be.true;
    });

    it('should be invalid if low value is higher than or equal to high value', () => {
      expect(validators.isValidRange.func(<any>{ range: true, low: 50, high: 40 })).to.be.false;
      expect(validators.isValidRange.func(<any>{ range: true, low: 40, high: 40 })).to.be.false;
    });
  });

  describe('isValueRefinement', () => {
    it('should use isString validator', () => {
      const value = 'brand';
      const isString = stub(validators.isString, 'func').returns(true);

      expect(validators.isValueRefinement.func(<any>{ value })).to.be.true;
      expect(isString).to.be.calledWithExactly(value);
    });

    it('should be valid if range refinement', () => {
      expect(validators.isValueRefinement.func(<any>{ range: true })).to.be.true;
    });

    it('should be invalid if not a range refinement', () => {
      expect(validators.isValueRefinement.func(<any>{ range: false })).to.be.false;
    });
  });

  describe('isRefinementDeselectedByValue', () => {
    const navigationId = 'brand';

    it('should be valid if no matching navigation', () => {
      const state: any = { a: 'b' };
      const navigation = stub(Selectors, 'navigation');

      expect(validators.isRefinementDeselectedByValue.func({ navigationId }, state)).to.be.true;
      expect(navigation).to.be.calledWithExactly(state, navigationId);
    });

    it('should be valid if no matching refinement in navigation', () => {
      stub(Selectors, 'navigation').returns({ selected: [1], refinements: [{}, { value: 'boar' }] });

      expect(validators.isRefinementDeselectedByValue.func({ navigationId, value: 'bear' })).to.be.true;
    });

    it('should be invalid matching refinement exists already', () => {
      const value = 'bear';
      stub(Selectors, 'navigation').returns({ selected: [1], refinements: [{}, { value }] });

      expect(validators.isRefinementDeselectedByValue.func({ navigationId, value })).to.be.false;
    });
  });

  describe('isRefinementSelectedByIndex', () => {
    const navigationId = 'colour';
    const index = 8;

    it('should be valid if refinement is deselected', () => {
      const state: any = { a: 'b' };
      const isRefinementDeselected = stub(Selectors, 'isRefinementDeselected').returns(true);

      expect(validators.isRefinementDeselectedByIndex.func({ navigationId, index }, state)).to.be.true;
      expect(isRefinementDeselected).to.be.calledWithExactly(state, navigationId, index);
    });

    it('should be invalid if refinement is selected', () => {
      stub(Selectors, 'isRefinementDeselected').returns(true);

      expect(validators.isRefinementDeselectedByIndex.func({ navigationId, index })).to.be.true;
    });
  });

  describe('isRefinementDeselectedByIndex', () => {
    const navigationId = 'brand';
    const index = 5;

    it('should be valid if refinement is selected', () => {
      const state: any = { a: 'b' };
      const isRefinementSelected = stub(Selectors, 'isRefinementSelected').returns(true);

      expect(validators.isRefinementSelectedByIndex.func({ navigationId, index }, state)).to.be.true;
      expect(isRefinementSelected).to.be.calledWithExactly(state, navigationId, index);
    });

    it('should be invalid if refinement is deselected', () => {
      stub(Selectors, 'isRefinementSelected').returns(true);

      expect(validators.isRefinementSelectedByIndex.func({ navigationId, index })).to.be.true;
    });
  });

  describe('isCollectionDeselected', () => {
    const collection = 'alternative';

    it('should be valid if collection is deselected', () => {
      const state: any = { a: 'b' };
      const isCollectionDeselected = stub(Selectors, 'collection').returns('main');

      expect(validators.isCollectionDeselected.func(collection, state)).to.be.true;
      expect(isCollectionDeselected).to.be.calledWithExactly(state);
    });

    it('should be invalid if collection is selected', () => {
      stub(Selectors, 'collection').returns(collection);

      expect(validators.isCollectionDeselected.func(collection)).to.be.false;
    });
  });

  describe('isSortDeselected', () => {
    const index = 8;

    it('should be valid if sort is deselected', () => {
      const state: any = { a: 'b' };
      const sortIndex = stub(Selectors, 'sortIndex').returns(4);

      expect(validators.isSortDeselected.func(index, state)).to.be.true;
      expect(sortIndex).to.be.calledWithExactly(state);
    });

    it('should be valid if sort is selected', () => {
      stub(Selectors, 'sortIndex').returns(index);

      expect(validators.isSortDeselected.func(index)).to.be.false;
    });
  });
});
