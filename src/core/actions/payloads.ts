import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import RecommendationsAdapter from '../adapters/recommendations';
import Configuration from '../configuration';
import Store from '../store';

namespace Payload {
  export namespace Fetch {
    export interface Override<T> {
      request?: T;
    }

    export interface MoreRefinements extends Navigation.Id, Override<Request> {}
    export interface MoreProducts extends More, Override<Request> {}
    export interface AutocompleteSuggestions extends SimpleQuery, Override<QueryTimeAutocompleteConfig> {}
    export interface AutocompleteProducts extends Autocomplete.Products, Override<Request> {}
    export interface CollectionCount extends Collection.Name, Override<Request> {}
    export interface Details extends Id, Override<Request> {}
    export interface PastPurchases extends Partial<SimpleQuery>, Override<Request> {}
    export interface MorePastPurchases extends More, Override<Request> {}
    export interface Search extends Override<Request> {}
    export interface Recommendations extends Override<RecommendationsAdapter.RecommendationsRequest> {}
  }

  export interface More {
    amount: number;
    forward: boolean;
  }

  export namespace Personalization {
    export interface Biasing {
      field: string;
      value: string;
      bias: Store.Personalization.SingleBias;
      config?: Configuration.Personalization.RealTimeBiasing;
    }
  }

  export interface Id {
    id: string;
  }

  export namespace Component {
    export interface Identifier extends Id {
      tagName: string;
    }

    export interface State extends Identifier {
      state: object;
    }
  }

  export namespace Collection {
    export interface Name {
      collection: string;
    }

    export interface Count extends Name {
      count: number;
    }
  }

  export interface SimpleQuery {
    query: string;
  }

  export interface Query {
    corrected?: string;
    related?: string[];
    didYouMean?: string[];
    rewrites?: string[];
    original?: string;
  }

  // note: Isn't getting the right type in generated doc for some reason
  export interface Search
    extends Partial<SimpleQuery>,
    Partial<Navigation.Refinement>,
    Partial<Navigation.AddRefinement> {

    /**
     * only for refinements
     * if true, replace refinements with the provided ones
     * if false, add the provided refinements
     */
    clear?: boolean | string;
  }

  export namespace Autocomplete {
    export interface Products extends SimpleQuery {
      refinements: Payload.Autocomplete.Refinement[];
    }

    export interface Suggestions {
      suggestions: Store.Autocomplete.Suggestion[];
      categoryValues: string[];
      navigations: Store.Autocomplete.Navigation[];
    }

    export interface Refinement {
      field: string;
      value: string;
    }
  }

  export namespace Navigation {
    // tslint:disable-next-line no-shadowed-variable
    export interface Id {
      navigationId: string;
    }

    export interface Refinement extends Navigation.Id {
      index: number;
    }

    export interface AddRefinement extends Navigation.Id {
      range?: boolean;

      // used to add new value refinement
      value?: string;

      // used to add new range refinement
      low?: number;
      high?: number;
    }

    export interface MoreRefinements extends Navigation.Id {
      refinements: Store.Refinement[];
      selected: number[];
    }
  }

  export interface Page {
    previous: number;
    next: number;
    last: number;
    from: number;
    to: number;
    current?: number;
  }

  export interface InfiniteScroll {
    isFetchingForward?: boolean;
    isFetchingBackward?: boolean;
  }

  export namespace Session {
    export enum IdKey {
      recallId = 'recallId',
      searchId = 'searchId',
    }

    export interface SessionId {
      key: IdKey;
      id: string;
    }
  }
}
export default Payload;
