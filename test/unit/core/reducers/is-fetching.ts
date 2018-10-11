import { Actions, Store } from '../../../../src/core';
import isFetching from '../../../../src/core/reducers/is-fetching';
import suite from '../../_suite';

suite('isFetching', ({ expect }) => {
  const state: Store.IsFetching = {
    moreRefinements: false,
    moreProducts: false,
    search: false,
    autocompleteSuggestions: false,
    autocompleteProducts: false,
    details: false,
  };

  function expectStartFetching(type: string, section: string) {
    it(`it should set ${section} to true on ${type}`, () => {
      const newState = isFetching(state, <any>{ type });

      expect(newState).to.eql({ ...state, [section]: true });
    });
  }

  function expectDoneFetching(type: string, section: string) {
    it(`it should set ${section} to false on ${type}`, () => {
      const newState = isFetching({ ...state, [section]: true }, <any>{ type });

      expect(newState).to.eql(state);
    });
  }

  describe('updateIsFetching()', () => {
    expectStartFetching(Actions.FETCH_MORE_REFINEMENTS, 'moreRefinements');
    expectDoneFetching(Actions.RECEIVE_MORE_REFINEMENTS, 'moreRefinements');

    expectStartFetching(Actions.FETCH_MORE_PRODUCTS, 'moreProducts');
    expectDoneFetching(Actions.RECEIVE_MORE_PRODUCTS, 'moreProducts');

    expectStartFetching(Actions.FETCH_PRODUCTS_WITHOUT_HISTORY, 'search');
    expectStartFetching(Actions.FETCH_PRODUCTS, 'search');
    expectDoneFetching(Actions.RECEIVE_PRODUCTS, 'search');

    expectStartFetching(Actions.FETCH_AUTOCOMPLETE_SUGGESTIONS, 'autocompleteSuggestions');
    expectDoneFetching(Actions.RECEIVE_AUTOCOMPLETE_SUGGESTIONS, 'autocompleteSuggestions');

    expectStartFetching(Actions.FETCH_AUTOCOMPLETE_PRODUCTS, 'autocompleteProducts');
    expectDoneFetching(Actions.RECEIVE_AUTOCOMPLETE_PRODUCTS, 'autocompleteProducts');

    expectStartFetching(Actions.FETCH_PRODUCT_DETAILS, 'details');
    expectDoneFetching(Actions.RECEIVE_DETAILS, 'details');

    it('should return state on default', () => {
      const newState = isFetching(state, <any>{});

      expect(newState).to.eql(state);
    });
  });
});
