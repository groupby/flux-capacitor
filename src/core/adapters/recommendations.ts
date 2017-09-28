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

  // tslint:disable-next-line max-line-length
  export const sortNavigations = (results: Navigation[], navigations: Store.Recommendations.Navigation[]): Navigation[] =>
    sortBasedOn(results, navigations, (unsorted, sorted) => unsorted.name === sorted.name);

  // tslint:disable-next-line max-line-length
  export const sortRefinements = (results: Navigation[], navigations: Store.Recommendations.Navigation[]): Navigation[] => {
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

  export const pinNavigations = (results: Navigation[], config: Configuration): Navigation[] => {
    const pinnedArray = ConfigurationAdapter.extractNavigationsPinned(config);
    return sortBasedOn(results, pinnedArray, (unsorted, pinnedName) => unsorted.name === pinnedName);
  };

  export const pinRefinements = (results: Navigation[], config: Configuration): Navigation[] => {
    const newNavigations = [];
    const pinnedRefinements: Configuration.Pinned = ConfigurationAdapter.extractRefinementsPinned(config);
    const pinnedRefinementsNavigationsArray: Store.Recommendations.Navigation[] = [];
    Object.keys(pinnedRefinements).forEach((key) =>
      pinnedRefinementsNavigationsArray.push({
        name: key,
        values: pinnedRefinements[key].map((value) => ({
          value,
          count: -1
        }))
      }));
    return sortRefinements(results, pinnedRefinementsNavigationsArray);
  };

  export interface RecommendationsBody {
    size?: number;
    window?: string;
    type?: string;
    target?: string;
  }
}

export default Recommendations;
