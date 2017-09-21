import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveRecommendationsProducts | Actions.ReceiveRecommendationsRefinements;
export type State = Store.Recommendations;

export const DEFAULTS: State = {
  products: []
};

export default function updateRecommendations(state: State = DEFAULTS, action: Action): State {
  console.log(action);
  switch (action.type) {
    case Actions.RECEIVE_RECOMMENDATIONS_PRODUCTS: return updateProducts(state, action);
    case Actions.RECEIVE_RECOMMENDATIONS_REFINEMENTS: return updateNavigations(state, action);
    default: return state;
  }
}

export const updateProducts = (state: State, { payload }: Actions.ReceiveRecommendationsProducts) =>
  ({ ...state, products: payload });

export const updateNavigations = (state: State, { payload }: Actions.ReceiveRecommendationsRefinements) =>
  ({ ...state });
