import * as redux from 'redux';

import Actions from '../../actions';
import ActionCreators from '../../actions/creators';

import area from './area';
import autocomplete from './autocomplete';
import collections from './collections';
import details from './details';
import infiniteScroll from './infinite-scroll';
import navigations from './navigations';
import page from './page';
import pastPurchases from './past-purchases';
import personalization from './personalization';
import products from './products';
import productsLoaded from './productsLoaded';
import query from './query';
import recommendations from './recommendations';
import recordCount from './record-count';
import redirect from './redirect';
import sorts from './sorts';
import template from './template';

export default function(section: Actions.StoreSection) {
  return redux.combineReducers({
    area: wrapReducer(area, section),
    autocomplete: wrapReducer(autocomplete, section),
    collections: wrapReducer(collections, section),
    details: wrapReducer(details, section),
    fields: (state = []) => state,
    infiniteScroll: wrapReducer(infiniteScroll, section),
    navigations: wrapReducer(navigations, section),
    page: wrapReducer(page, section),
    personalization: wrapReducer(personalization, section),
    products: wrapReducer(products, section),
    productsLoaded: wrapReducer(productsLoaded, section),
    query: wrapReducer(query, section),
    recommendations: wrapReducer(recommendations, section),
    pastPurchases: wrapReducer(pastPurchases, section),
    recordCount: wrapReducer(recordCount, section),
    redirect: wrapReducer(redirect, section),
    sorts: wrapReducer(sorts, section),
    template: wrapReducer(template, section),
  });
}

export function wrapReducer<T>(reducer: redux.Reducer<T>, section: Actions.StoreSection) {
  return (state, action) => reducer(state, action.meta.section === section ? action : ActionCreators.nop());
}
