import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveRecommendations;
export type State = Store.Recommendations;

export const DEFAULTS: State = {
  productIds: [],
  products: []
};

export default function updateRecommendations(state: State = DEFAULTS, action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_RECOMMENDATION_PRODUCTS: return action.payload;
    default: return state;
  }
}
