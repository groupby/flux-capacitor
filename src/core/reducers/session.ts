import Actions from '../actions';
import Payload from '../actions/payloads';
import Configuration from '../configuration';
import Store from '../store';

export type Action = Actions.UpdateLocation | Actions.UpdateSecuredPayload  |
  Actions.Action<string, any>;
export type State = Store.Session;

export default function updateSession(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_LOCATION: return updateLocation(state, action.payload);
    case Actions.UPDATE_SECURED_PAYLOAD: return updateSecuredPayload(state, action.payload);
    case Actions.UPDATE_SESSION_ID: return updateSessionId(state, action.payload);
    default: {
      if (action.meta && 'tag' in action.meta) {
        state = updateOrigin(state, action.meta);
      }
      return state;
    }
  }
}

export const updateSecuredPayload = (state, securedPayload: Configuration.Recommendations.SecuredPayload) =>
  ({
    ...state,
    config: {
      ...state.config,
      recommendations: {
        ...state.config.recommendations,
        pastPurchases: {
          ...state.config.recommendations.pastPurchases,
          securedPayload
        }
      }
    }
  });

export const updateLocation = (state: State, location: Store.Geolocation) =>
  ({ ...state, location });

export const updateOrigin = (state: State, { tag: origin }: Actions.Metadata) =>
  ({ ...state, origin });

export const updateSessionId = (state: State, { key, id }: Payload.Session.SessionId) =>
  ({ ...state, [key]: id });
