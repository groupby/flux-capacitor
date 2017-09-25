import { Navigation, Results, ValueRefinement } from 'groupby-api';
import * as effects from 'redux-saga/effects';
import Store from '../store';
import { fetch, sortBasedOn } from '../utils';

namespace Recommendations {

  export const buildUrl = (customerId: string, endpoint: string, mode: string) =>
    `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/${endpoint}/_get${mode}`;

  export const buildBody = (body: RecommendationsBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });
  // tslint:disable-next-line max-line-length
  export const sortNavigations = (results: Navigation[], navigations: Store.Recommendations.Navigation[]): Navigation[] => {
    return sortBasedOn(results,
      navigations, (unsorted: any, sorted: any) => unsorted.name === sorted.name);
  };
  // tslint:disable-next-line max-line-length
  export const sortRefinements = (results: Navigation[], navigations: Store.Recommendations.Navigation[]) => {
    // const newAvailableNavigations = { ...results.availableNavigation};
    results.forEach((product) => {
      const index = navigations.findIndex(({ name }) => product.name === name);
      if (index !== -1) {
        product.refinements = sortBasedOn(product.refinements, navigations[index].values,
          (unsorted: ValueRefinement, sorted) => unsorted.value.toLowerCase() === sorted.value.toLowerCase());
      }
    });
  };

  export interface RecommendationsBody {
    size?: number;
    window?: string;
    type?: string;
    target?: string;
  }
}

export default Recommendations;
