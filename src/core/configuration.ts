import { BrowserBridge, Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig, Sayt } from 'sayt';

interface Configuration {
  /**
   * GroupBy customer ID
   */
  customerId: string;
  /**
   * ID unique to the viewer of the rendered page
   */
  visitorId?: string;
  /**
   * ID unique to the session of the viewer of the rendered page
   */
  sessionId?: string;

  /**
   * area of search data
   */
  area?: string;
  /**
   * input language for the search engine
   */
  language?: string;
  /**
   * collection of search data or collection options
   */
  collection?: Configuration.ValueOptions<string>;

  /**
   * state initial configuration for SAYT
   */
  autocomplete?: Configuration.Autocomplete;

  /**
   * state initial configuration for Searchandiser
   */
  search?: Configuration.Search;

  /**
   * state initial configuration for Recommendations
   */
  recommendations?: Configuration.Recommendations;

  /**
   * network request configuration
   */
  network?: Configuration.Bridge;
}

namespace Configuration {
  export interface Bridge {
    /**
     * map of headers to send with search requests
     */
    headers?: { [key: string]: string };
    /**
     * send requests over HTTPS
     */
    https?: boolean;
    /**
     * connection timeout for search requests
     */
    timeout?: number;
    /**
     * global request error handler
     */
    errorHandler?: (error: Error) => void;
    /**
     * add SkipCache header to search requests
     */
    skipCache?: boolean;
    /**
     * add SkipSemantish header to search requests
     */
    skipSemantish?: boolean;
  }

  export interface Clients {
    bridge: BrowserBridge;
    sayt: Sayt;
  }

  export interface Search {
    /**
     * product fields to request
     * auto-generated from structure if not provided
     */
    fields?: string[];
    /**
     * number of products to request or sort options and default
     */
    pageSize?: Configuration.ValueOptions<number>;
    /**
     * sorting of products or sort options and default
     */
    sort?: Configuration.ValueOptions<{
      /**
       * field path to sort on
       */
      field: string;
      descending?: boolean;
    }>;
    /**
     * redirect to the details page of product if there is only 1 product result for a search
     */
    redirectSingleResult: boolean;
    /**
     * default request values
     */
    defaults?: Partial<Request> | ((request: Partial<Request>) => Partial<Request>);
    /**
     * override any computed request value
     */
    overrides?: Partial<Request> | ((request: Partial<Request>) => Partial<Request>);
  }

  export interface Autocomplete {
    /**
     * area override
     */
    area?: string;
    /**
     * collection override
     */
    collection?: string;
    /**
     * language override
     */
    language?: string;
    /**
     * category field used to render sayt results
     */
    category?: string;
    /**
     * number of suggestions to request
     */
    suggestionCount?: number;
    /**
     * number of navigations to request
     */
    navigationCount?: number;
    // TODO: this should go in the tag configuration as it is for display only
    /**
     * map of field to label, also restricts displayed navigations if provided
     */
    navigations?: { [field: string]: string };
    /**
     * whether to sort the returned suggestions alphabetically
     */
    alphabetical?: boolean;
    /**
     * whether to use fuzzy matching for suggestion results
     */
    fuzzy?: boolean;
    /**
     * autocomplete products settings
     */
    products?: Configuration.Autocomplete.Products;
    /**
     * recommendations API settings
     */
    recommendations?: Configuration.Autocomplete.Recommendations;
    /**
     * default request values
     */
    defaults?: {
      // tslint:disable-next-line max-line-length
      suggestions?: QueryTimeAutocompleteConfig | ((config: QueryTimeAutocompleteConfig) => QueryTimeAutocompleteConfig);
      products?: QueryTimeProductSearchConfig | ((config: QueryTimeProductSearchConfig) => QueryTimeProductSearchConfig);
    };
    /**
     * override any computed request value
     */
    overrides?: {
      // tslint:disable-next-line max-line-length
      suggestions?: QueryTimeAutocompleteConfig | ((config: QueryTimeAutocompleteConfig) => QueryTimeAutocompleteConfig);
      products?: QueryTimeProductSearchConfig | ((config: QueryTimeProductSearchConfig) => QueryTimeProductSearchConfig);
    };
  }

  export namespace Autocomplete {
    export interface Recommendations {
      /**
       * number of suggestions to request
       */
      suggestionCount: number;
      /**
       * type of product siuggestions to request
       */
      suggestionMode: RecommendationMode;
      /**
       * set to true to enable location-specific autocomplete recommendations
       */
      location: boolean;
    }

    export interface Products {
      /**
       * area override
       */
      area?: string;
      /**
       * collection override
       */
      collection?: string;
      /**
       * language override
       */
      language?: string;
      /**
       * number of products to request
       */
      count: number;
    }
  }

  export interface Recommendations {
    productSuggestions: Configuration.Recommendations.ProductSuggestions;
    iNav: Configuration.Recommendations.INav;
    pastPurchases: Configuration.Recommendations.PastPurchases;
  }

  export namespace Recommendations {
    export interface ProductSuggestions {
      /**
       * Number of products to request.
       */
      productCount: number;
      /**
       * Product ID field as used in recommendations.
       */
      idField: string;
      /**
       * Type of product recommendations to request.
       */
      mode: Configuration.RecommendationMode;
    }

    export interface PastPurchases {
      /**
       * Number of products to request.
       */
      productCount: number;
    }

    // tslint:disable-next-line interface-name
    export interface INav {
      /**
       * Navigation settings.
       */
      navigations: Navigations;
      /**
       * Refinement settings.
       */
      refinements: Refinements;
      /**
       * Minimum number of navigations required in response.
       */
      minSize?: number;
      /**
       * Maximum number of navigations to return.
       */
      size: number;
      /**
       * Time period of recorded recommendations.
       */
      window: 'day' | 'week' | 'month';
    }

    export interface Navigations {
      /**
       * Whether to sort navigations.
       */
      sort: boolean;
      /**
       * Navigations to pin to the top regardless of recommendations.
       */
      pinned?: string[];
    }

    export interface Refinements {
      /**
       * Whether to sort refinements, or array of what refinements to sort.
       */
      sort: boolean | string[];
      /**
       * Refinements to pin to the top regardless of recommendations.
       */
      pinned?: Configuration.Recommendations.Pinned;
    }

    export interface Pinned {
      [id: string]: string[];
    }
  }

  export type ValueOptions<T> = T | { options: T[], default: T };

  export type RecommendationMode = keyof typeof RECOMMENDATION_MODES;

  export const RECOMMENDATION_MODES = {
    popular: 'Popular',
    trending: 'Trending',
    recent: 'Recent'
  };
}

export default Configuration;
