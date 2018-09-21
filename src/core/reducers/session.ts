import Actions from '../actions';
import Configuration from '../configuration';
import Store from '../store';

export type Action = Actions.UpdateLocation | Actions.UpdateSecuredPayload  |
  Actions.Action<string, any>;
export type State = Store.Session;

export default function updateSession(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_LOCATION: return updateSection(state, action.payload, 'location');
    case Actions.UPDATE_SECURED_PAYLOAD: return updateSecuredPayload(state, action.payload);
    default: {
      if (action.meta) {
        ['recallId', 'searchId', 'detailsId', 'pastPurchaseId'].forEach((section) => {
          if (section in action.meta) {
            state = updateSection(state, action.meta[section], section);
          }
        });

        if ('tag' in action.meta) {
          state = updateSection(state, action.meta.tag, 'origin');
        }
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

export const updateSection = (state: State, value: any, section: string) =>
  ({ ...state, [section]: value });
