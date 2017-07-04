import * as redux from 'redux';
import undoable from 'redux-undo';

import area from './area';
import autocomplete from './autocomplete';
import collections from './collections';
import details from './details';
import errors from './errors';
import navigations from './navigations';
import page from './page';
import products from './products';
import query from './query';
import recordCount from './record-count';
import redirect from './redirect';
import sorts from './sorts';
import template from './template';
import warnings from './warnings';

export default redux.combineReducers({
  area,
  autocomplete,
  collections,
  details,
  errors,
  fields: (state = []) => state,
  navigations,
  page,
  products,
  // query: undoable(query, { limit: 5 }),
  query,
  recordCount,
  redirect,
  sorts,
  template,
  warnings,
});
