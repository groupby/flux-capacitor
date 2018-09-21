import { SelectedRefinement, Sort } from 'groupby-api';
import Store from '../store';
import { MAX_RECORDS } from './search';

namespace Adapter {
  export const clampPageSize = (page: number, pageSize: number): number =>
    Math.min(pageSize, MAX_RECORDS - Adapter.extractSkip(page, pageSize));

  export const extractSkip = (page: number, pageSize: number): number =>
    (page - 1) * pageSize;

  export const extractSort = ({ field, descending }: Store.Sort): Sort =>
    ({ field, order: descending ? 'Descending' : undefined });

  export const extractRefinement = (field: string, refinement: Store.Refinement): SelectedRefinement =>
    (<Store.ValueRefinement>refinement).value
      ? { navigationName: field, type: 'Value', value: (<Store.ValueRefinement>refinement).value }
      // tslint:disable-next-line max-line-length
      : { navigationName: field, type: 'Range', high: (<Store.RangeRefinement>refinement).high, low: (<Store.RangeRefinement>refinement).low };
}

export default Adapter;
