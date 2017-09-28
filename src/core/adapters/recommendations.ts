import { Navigation, Results, ValueRefinement } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import Configuration from '../configuration';
import Store from '../store';
import { fetch, sortBasedOn } from '../utils';
import ConfigurationAdapter from './configuration';

namespace Recommendations {

  export const buildUrl = (customerId: string, endpoint: string, mode: string) =>
    `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/${endpoint}/_get${mode}`;

  export const buildBody = (body: RecommendationsBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });

  export const sortNavigations = ({ results, navigations }: Navigations): Navigation[] =>
    sortBasedOn(results, navigations, (unsorted, sorted) => unsorted.name === sorted.name);

  export const sortRefinements = ({ results, navigations }: Navigations): Navigation[] => {
    const newNavigations = [];
    results.forEach((product) => {
      const index = navigations.findIndex(({ name }) => product.name === name);
      if (index !== -1) {
        newNavigations.push({
          ...product,
          refinements: sortBasedOn(product.refinements, navigations[index].values,
            (unsorted: ValueRefinement, sorted) => unsorted.value.toLowerCase() === sorted.value.toLowerCase())
        });
      } else {
        newNavigations.push({ ...product });
      }
    });
    return newNavigations;
  };

  export const pinNavigations = ({ results, config }: NavigationsAndConfig): Navigation[] => {
    const pinnedArray = ConfigurationAdapter.extractNavigationsPinned(config);
    return sortBasedOn(results, pinnedArray, (unsorted, pinnedName) => unsorted.name === pinnedName);
  };

  export const pinRefinements = ({ results, config }: NavigationsAndConfig): Navigation[] => {
    const newNavigations = [];
    const pinnedRefinements: Configuration.Recommendations.Pinned =
      ConfigurationAdapter.extractRefinementsPinned(config);
    const pinnedRefinementsNavigationsArray: Store.Recommendations.Navigation[] =
      Object.keys(pinnedRefinements).map((key) =>
        ({
          name: key,
          values: pinnedRefinements[key].map((value) => ({
            value,
            count: -1
          }))
        }));
    return sortRefinements({ results, navigations: pinnedRefinementsNavigationsArray });
  };

  // tslint:disable-next-line max-line-length
  export const transformNavigations = (availableNavigations: Navigation[], navigations: Store.Recommendations.Navigation[], config: Configuration): Navigation[] => {
    const iNav = ConfigurationAdapter.extractINav(config);
    const noop = ((x) => x.results);
    const transformations = [
      iNav.navigations.sort ? sortNavigations : noop,
      Array.isArray(iNav.navigations.pinned) ? pinNavigations : noop,
      iNav.refinements.sort ? sortRefinements : noop,
      iNav.refinements.pinned ? pinRefinements : noop
    ];
    return transformations.reduce(
      (results, transform: any) => transform({ results, navigations, config }), availableNavigations);
  };

  export interface RecommendationsBody {
    size?: number;
    window?: string;
    type?: string;
    target?: string;
  }

  export interface NavigationsAndConfig {
    results: Navigation[];
    config: Configuration;
  }

  export interface Navigations {
    results: Navigation[];
    navigations: Store.Recommendations.Navigation[];
  }
}

export default Recommendations;
