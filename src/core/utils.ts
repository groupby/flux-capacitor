import * as fetchPonyfill from 'fetch-ponyfill';
import Actions from './actions';
import SearchAdapter from './adapters/search';
import Selectors from './selectors';

export const { fetch } = fetchPonyfill();

// tslint:disable-next-line variable-name
export const Routes = {
  SEARCH: 'search',
  DETAILS: 'details',
  NAVIGATION: 'navigation'
};

export const rayify = <T>(arr: T | T[]): T[] => Array.isArray(arr) ? arr : [arr];

// tslint:disable-next-line max-line-length
export const action = <P, T extends string, M extends Actions.Metadata | {} = {}>(type: T, payload?: P, meta?: M): Actions.Action<T, P, M | {}> => {
  const builtAction: Actions.Action<T, P, M | {}> = { type, meta: meta || {} };

  if (payload != null) {
    builtAction.payload = payload;
    if (payload instanceof Error) {
      builtAction.error = true;
    }
  }
  return builtAction;
};

export const refinementPayload = (field: string, valueOrLow: any, high: any = null) =>
  typeof high === 'number' ?
    {
      navigationId: field,
      low: valueOrLow,
      high,
      range: true
    } :
    {
      navigationId: field,
      value: valueOrLow
    };

// a passthrough to allow error to propagate to middleware
// tslint:disable-next-line max-line-length
export const handleError = (errorAction: Actions.Action<any>,  createAction: () => any) =>
  errorAction.error ? errorAction :  createAction();

export const shouldResetRefinements =  ({ low, high, value, navigationId, range, index }: Actions.Payload.Search,
                                        state: any): boolean => {
  const currentRefinements = Selectors.selectedRefinements(state);
  // assumes only one refinement can be added at once
  return (!navigationId || currentRefinements.length !== 1 ||
          (index && !Selectors.isRefinementSelected(state, navigationId, index)) ||
          !SearchAdapter.refinementsMatch(<any>{ low, high, value }, currentRefinements[0], range ? 'Range' : 'Value'));
};

export const sortBasedOn = (toBeSorted: any[], basisArray: any[], callback: any): any[] => {
  const output: any[] = [];
  const ids = toBeSorted.concat();
  console.log(toBeSorted);
  console.log(basisArray);
  basisArray.forEach((basis) => {
    const index = ids.findIndex((sortElement) => callback ? callback(basis, sortElement) :
                                sortElement === basis);
    if (index !== -1) {
      output.push(basis);
      ids.splice(index, 1);
    }
  });
  console.log(output);
  return output.concat(ids);
};
