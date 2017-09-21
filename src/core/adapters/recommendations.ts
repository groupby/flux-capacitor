import * as effects from 'redux-saga/effects';
import { fetch } from '../utils';

namespace Recommendations {

  export const buildUrl = (customerId: string, endpoint: string, mode: string) =>
    `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations/${endpoint}/_get${mode}`;

  export const buildBody = (body: RecommendationsBody) => ({
    method: 'POST',
    body: JSON.stringify(body)
  });

  export interface RecommendationsBody {
    size?: number;
    window?: string;
    type?: string;
    target?: string;
  }
}

export default Recommendations;
