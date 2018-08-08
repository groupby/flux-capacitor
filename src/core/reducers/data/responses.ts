import Actions from '../../actions';
import Store from '../../store';

export type Action = Actions.ReceiveSearchResponse
  | Actions.ReceiveSaytResponse
  | Actions.ReceiveRecommendationsResponse
  | Actions.ReceivePastPurchaseResponse;
export type State = {};

export default function updateResponse(state: State = [], action: Action): State {
  switch (action.type) {
    case Actions.RECEIVE_SEARCH_RESPONSE:
    case Actions.RECEIVE_SAYT_RESPONSE:
    case Actions.RECEIVE_RECOMMENDATIONS_RESPONSE:
    case Actions.RECEIVE_PAST_PURCHASE_RESPONSE:
      return receiveResponse(state, action.payload);
    default: return state;
  }
}

// tslint:disable-next-line max-line-length
export const receiveResponse = (state: State, payload: Actions.ReceiveMoreProducts | Actions.ReceiveMorePastPurchaseProducts) =>
  ({ ...state, ...payload });
