namespace Recommendations {

  export const buildUrl = (customerId: string) =>
    `https://${customerId}.groupbycloud.com/wisdom/v2/public/recommendations`;

  export const buildRequest = (customerId: string, mode: string, body: RecommendationsBody) => {

  }

  export interface RecommendationsBody {
    size?: number;
    window?: string;
    type?: string;
    target?: string;
  }
}

export default Recommendations;
