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
  autocomplete?: {
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
    /**
     * number of products to request
     */
    productCount?: number;
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
     * recommendations API settings
     */
    recommendations?: Configuration.Recommendations;
    /**
     * default request values
     */
    defaults?: {
      suggestions?: QueryTimeAutocompleteConfig;
      products?: QueryTimeProductSearchConfig;
    };
    /**
     * override any computed request value
     */
    overrides?: {
      suggestions?: QueryTimeAutocompleteConfig;
      products?: QueryTimeProductSearchConfig;
    };
  };

  /**
   * state initial configuration for Searchandiser
   */
  search?: {
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
     * default request values
     */
    defaults?: Partial<Request>;
    /**
     * override any computed request value
     */
    overrides?: Partial<Request>;
  };

  recommendations?: {
    productCount: number;
    idField: string;
    mode: Configuration.RecommendationMode;
  };

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

  export type ValueOptions<T> = T | { options: T[], default: T };

  export interface Recommendations {
    suggestionCount: number;
    suggestionMode: RecommendationMode;
    location: boolean;
  }

  export type RecommendationMode = keyof typeof RECOMMENDATION_MODES;

  export const RECOMMENDATION_MODES = {
    popular: 'Popular',
    trending: 'Trending',
    recent: 'Recent'
  };
}

export default Configuration;
