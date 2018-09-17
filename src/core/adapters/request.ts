import Store from '../store';
import { MAX_RECORDS } from './search';

namespace Adapter {
  export const clampPageSize = (page: number, pageSize: number) =>
    Math.min(pageSize, MAX_RECORDS - Adapter.extractSkip(page, pageSize));

  export const extractSkip = (page: number, pageSize: number) =>
    (page - 1) * pageSize;

  export const extractSort = ({ field, descending }: Store.Sort) =>
    ({ field, order: descending ? 'Descending' : undefined });

  export const extractRefinement = (field, { value, high, low }) =>
    value
      ? { navigationName: field, type: 'Value', value }
      : { navigationName: field, type: 'Range', high, low };
}

export default Adapter;
