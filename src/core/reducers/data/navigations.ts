import Actions from '../../actions';
import Adapter from '../../adapters/search';
import Store from '../../store';
import { sortBasedOn } from '../../utils';

export type Action = Actions.ResetRefinements
  | Actions.AddRefinement
  | Actions.ReceiveNavigations
  | Actions.ReceiveRecommendationsNavigations
  | Actions.ReceiveRecommendationsRefinements
  | Actions.SelectRefinement
  | Actions.DeselectRefinement
  | Actions.ReceiveMoreRefinements;
export type State = Store.Indexed<Store.Navigation>;

export const DEFAULTS: State = {
  allIds: [],
  byId: {},
};

export default function updateNavigations(state: State = DEFAULTS, action: Action) {
  switch (action.type) {
    case Actions.RESET_REFINEMENTS: return resetRefinements(state, action.payload);
    case Actions.RECEIVE_NAVIGATIONS: return receiveNavigations(state, action.payload);
    case Actions.RECEIVE_RECOMMENDATIONS_NAVIGATIONS: return sortNavigations(state, action.payload);
    case Actions.RECEIVE_RECOMMENDATIONS_REFINEMENTS: return sortRefinements(state, action.payload);
    case Actions.ADD_REFINEMENT: return addRefinement(state, action.payload);
    case Actions.SELECT_REFINEMENT: return selectRefinement(state, action.payload);
    case Actions.DESELECT_REFINEMENT: return deselectRefinement(state, action.payload);
    case Actions.RECEIVE_MORE_REFINEMENTS: return receiveMoreRefinements(state, action.payload);
    default: return state;
  }
}

export const resetRefinements = (state: State, navigationId: boolean | string) => {
  if (typeof navigationId === 'boolean') {
    return {
      ...state,
      byId: state.allIds.reduce((navs, nav) =>
        Object.assign(navs, { [nav]: { ...state.byId[nav], selected: [] } }), {})
    };
  } else {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          selected: []
        }
      }
    };
  }
};

export const receiveNavigations = (state: State, navigations: Store.Navigation[]) => {
  const allIds = navigations.map((nav) => nav.field);
  const byId = navigations.reduce((navs, nav) =>
    Object.assign(navs, { [nav.field]: nav }), {});
  return {
    ...state,
    allIds,
    byId,
  };
};

export const sortNavigations = (state: State, navigations: Store.Recommendations.Navigation[]) => {
  return { ...state, allIds: sortBasedOn(state.allIds, navigations, 'name') };
};

export const sortRefinements = (state: State, navigations: Store.Recommendations.Navigation[]) => {
  const newObj = {};
  state.allIds.forEach((id) => {
    const index = navigations.findIndex(({ name }) => id === name);
    if (index !== -1) {
      newObj[id] = { ...state.byId[id] };
      newObj[id].refinements = sortBasedOn(newObj[id].refinements, navigations[index].values, 'value');
    }
  });
  return { ...state, byId:
           { ...state.byId,
             ...newObj
           }
         };
};
  // state.allIds.forEach((id) => {
  //   const navigation = navigations.find(({ name }) => id === name);
  //   if (navigation) {
  //     console.log(state.byId[id].refinements);
  //     console.log(navigation.values);
  //     newObj[id] = sort(state.byId[id].refinements, navigation.values)
  //     // newObj[id] = sortBasedOn(newObj[id],
  //   } else {
  //     newObj[id] = { ...state.byId[id] };
  //   }
  // });

export const sort = (toBeSorted: any[], basisArray: any[]): any[] => {
  const output: string[] = [];
  const ids = toBeSorted.concat();
  basisArray.forEach((item) => {
    const index = ids.findIndex((element) => item.value === element.value);
    if (index !== -1) {
      console.log(ids[index]);
      output.push(item.value);
      ids.splice(index, 1);
    }
  });
  return output.concat(ids);
};

// tslint:disable-next-line max-line-length
export const selectRefinement = (state: State, { navigationId, index: refinementIndex }: Actions.Payload.Navigation.Refinement) => {
  if (navigationId && refinementIndex != null) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          selected: state.byId[navigationId].selected.concat(refinementIndex),
        },
      },
    };
  } else {
    return state;
  }
};

// tslint:disable-next-line max-line-length
export const deselectRefinement = (state: State, { navigationId, index: refinementIndex }: Actions.Payload.Navigation.Refinement) => {
  if (navigationId && refinementIndex != null) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          selected: state.byId[navigationId].selected.filter((index) => index !== refinementIndex),
        },
      },
    };
  } else {
    return state;
  }
};

const generateNavigation = (state: State, navigationId: string, refinement: any, index: number) => ({
  ...state.byId[navigationId],
  ...(index === -1
    ? {
      refinements: [
        ...state.byId[navigationId].refinements,
        refinement
      ],
      selected: [
        ...state.byId[navigationId].selected,
        state.byId[navigationId].refinements.length
      ]
    }
    : {
      selected: [...state.byId[navigationId].selected, index]
    })
});

// tslint:disable-next-line max-line-length
export const addRefinement = (state: State, { navigationId, value, low, high, range }: Actions.Payload.Navigation.AddRefinement) => {
  const refinement: any = range ? { low, high } : { value };

  if (navigationId in state.byId) {
    const index = state.byId[navigationId].refinements
      .findIndex((ref) => Adapter.refinementsMatch(ref, refinement, range ? 'Range' : 'Value'));

    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: generateNavigation(state, navigationId, refinement, index)
      }
    };
  } else {
    return {
      ...state,
      allIds: [...state.allIds, navigationId],
      byId: {
        ...state.byId,
        [navigationId]: {
          field: navigationId,
          label: navigationId,
          range,
          refinements: [refinement],
          selected: [0],
          metadata: {}
        }
      }
    };
  }
};

// tslint:disable-next-line max-line-length
export const receiveMoreRefinements = (state: State, { navigationId, refinements, selected }: Actions.Payload.Navigation.MoreRefinements) => {
  if (navigationId && refinements) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [navigationId]: {
          ...state.byId[navigationId],
          refinements,
          selected,
          more: false,
        },
      },
    };
  } else {
    return state;
  }
};
