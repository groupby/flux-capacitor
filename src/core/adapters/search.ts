import {
  Navigation,
  PageInfo,
  RangeRefinement,
  Record,
  Results,
  SelectedRefinement,
  SortType,
  Template,
  ValueRefinement,
  Zone,
} from 'groupby-api';
import Actions from '../actions';
import Configuration from '../configuration';
import Selectors from '../selectors';
import Store from '../store';
import ConfigAdapter from './configuration';
import Page from './page';

export const MAX_RECORDS = 10000;

namespace Adapter {

  // tslint:disable-next-line max-line-length
  export const extractQuery = ({ correctedQuery: corrected, didYouMean, relatedQueries: related, rewrites }: Results): Actions.Payload.Query =>
    ({ corrected, didYouMean, related, rewrites });

  export const extractRefinement = ({ type, value, low, high, count: total }: RangeRefinement & ValueRefinement):
    Store.ValueRefinement | Store.RangeRefinement =>
    type === 'Value' ? { value, total } : { low, high, total };

  export const extractNavigationSort = (sort: SortType): Store.Sort => {
    switch (sort) {
      case 'Count_Ascending': return { field: 'count' };
      case 'Count_Descending': return { field: 'count', descending: true };
      case 'Value_Ascending': return { field: 'value' };
      case 'Value_Descending': return { field: 'value', descending: true };
    }
  };

  export const extractNavigation = (navigation: Navigation): Store.Navigation => ({
    field: navigation.name,
    label: navigation.displayName,
    more: navigation.moreRefinements,
    or: navigation.or,
    range: !!navigation.range,
    max: navigation.max,
    min: navigation.min,
    refinements: navigation.refinements.map(Adapter.extractRefinement),
    selected: [],
    sort: navigation.sort && Adapter.extractNavigationSort(navigation.sort),
    metadata: navigation.metadata
      .reduce((metadata, keyValue) => Object.assign(metadata, { [keyValue.key]: keyValue.value }), {}),
  });

  export const refinementsMatch = (lhs: Store.Refinement, rhs: SelectedRefinement, type: string = rhs.type) => {
    if (type === 'Value') {
      return (<any>lhs).value === (<any>rhs).value;
    } else {
      return (<any>lhs).low === (<any>rhs).low && (<any>lhs).high === (<any>rhs).high;
    }
  };

  export const mergeSelectedRefinements = (available: Store.Navigation, selected: Navigation) => {
    available.selected = [];

    selected.refinements.forEach((refinement) => {
      const index = available.refinements.findIndex((availableRef) =>
        Adapter.refinementsMatch(<any>availableRef, <any>refinement));

      if (index !== -1) {
        available.selected.push(index);
      } else {
        const { value, low, high, total } = <any>refinement;
        const newIndex = available.refinements.push(available.range
          ? { low, high, total }
          : { value, total }) - 1;
        available.selected.push(newIndex);
      }
    });
  };

  export const pruneRefinements = (navigations: Store.Navigation[], state: Store.State): Store.Navigation[] => {
    const max = ConfigAdapter.extractMaxRefinements(Selectors.config(state));
    return max ? navigations.map((navigation) => {
      const show = navigation.selected.slice(0, max);
      for (let i = 0; i < navigation.refinements.length && show.length < max; i++) {
        if (!navigation.selected.includes(i)) {
          show.push(i);
        }
      }

      return {
        ...navigation,
          more: navigation.refinements.length > max || navigation.more,
          show,
      };
    }) : navigations;
  };

  export const filterExcludedNavigations = (navigations: Navigation[]): Navigation[] => {
    return navigations
      .map((navigation) => {
        const refinements = navigation.refinements.filter((ref: any) => !ref.exclude);
        return navigation = { ...navigation, refinements };
      })
      .reduce((acc, cur) => {
        if (cur.refinements.length > 0) acc = [...acc, cur];
        return acc;
      }, []);
  };

  // tslint:disable-next-line max-line-length
  export const combineNavigations = ({ availableNavigation: available, selectedNavigation: selected }: Results): Store.Navigation[] => {
    let navigations = available.reduce((map, navigation) =>
      Object.assign(map, { [navigation.name]: Adapter.extractNavigation(navigation) }), {});

    const filteredNavigations = filterExcludedNavigations(selected);

    filteredNavigations.forEach((selectedNav) => {
      const availableNav = navigations[selectedNav.name];

      if (availableNav) {
        Adapter.mergeSelectedRefinements(availableNav, selectedNav);
      } else {
        const navigation = Adapter.extractNavigation(selectedNav);
        navigation.selected = <any[]>Object.keys(Array(navigation.refinements.length).fill(0))
          .map((value) => Number(value));
        navigations = { [selectedNav.name]: navigation, ...navigations };
      }
    });

    return Object.keys(navigations).reduce((navs, key) => navs.concat(navigations[key]), []);
  };

  export const extractZone = (zone: Zone): Store.Zone => {
    switch (zone.type) {
      case 'Content': return {
        content: zone.content,
        name: zone.name,
        type: Store.Zone.Type.CONTENT,
      };
      case 'Rich_Content': return {
        content: zone.richContent,
        name: zone.name,
        type: Store.Zone.Type.RICH_CONTENT,
      };
      case 'Record': return {
        name: zone.name,
        query: zone.query,
        products: zone.records.map((record) => extractAllMeta(record)),
        type: Store.Zone.Type.PRODUCTS,
      };
    }
  };

  export const extractTemplate = (template: Template = <any>{ zones: [] }): Store.Template => ({
    name: template.name,
    rule: template.ruleName,
    zones: Object.keys(template.zones).reduce((zones, key) =>
      Object.assign(zones, { [key]: Adapter.extractZone(template.zones[key]) }), {}),
  });

  export const extractRecordCount = (results: Results) =>
    Math.min(results.totalRecordCount, MAX_RECORDS);

  // tslint:disable-next-line max-line-length
  export const extractPage = (state: Store.State, totalRecords: number, current?: number, pageSize?: number): Actions.Payload.Page => {
    const currentPageSize = pageSize || Selectors.pageSize(state);
    const currentPage = current || Selectors.page(state);
    const last = Page.finalPage(currentPageSize, totalRecords);
    const from = Page.fromResult(currentPage, currentPageSize);
    const to = Page.toResult(currentPage, currentPageSize, totalRecords);

    return {
      from,
      last,
      next: Page.nextPage(currentPage, last),
      previous: Page.previousPage(currentPage),
      to,
      current: currentPage,
    };
  };

  export const extractData = (products: Store.ProductWithMetadata[]) =>
    products.map(({ data }) => data);

  export const extractAllMeta = (product: Store.Product | Record) =>
    (<Record>product).allMeta || product;

  export const augmentProducts = (results: Results) => {
    const startIndex = results.pageInfo.recordStart;
    return results.records.map(({ collection, allMeta }, index) =>
      ({
        meta: { collection },
        index: startIndex + index,
        data: allMeta,
      }));
  };

  export const requestSort = ({ field, descending }: Store.Sort) =>
    ({ field, order: descending ? 'Descending' : undefined });
}

export default Adapter;
