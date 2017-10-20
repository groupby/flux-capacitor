import Configuration from '../configuration';
import * as AreaReducer from '../reducers/data/area';
import * as CollectionsReducer from '../reducers/data/collections';
import * as PageReducer from '../reducers/data/page';
import Store from '../store';

namespace Adapter {

  export const initialState = (config: Configuration): Partial<Store.State> =>
    ({
      data: <any>{
        present: {
          area: Adapter.extractArea(config, AreaReducer.DEFAULT_AREA),
          autocomplete: {
            suggestions: [],
            navigations: [],
            products: [],
            category: {
              field: Adapter.extractSaytCategoryField(config),
              values: []
            },
          },
          recommendations: {
            suggested: { products: [] },
            pastPurchases: { products: [{"productThumbnail":{"longDescription":"From boho feathers to beaded embellishments, David & Young has the headwrap that suits your style best.","shortDescription":"David & Young Headwraps"},"id":"2410215","title":"David & Young Headwraps","pdpData":{"onlineExclusive":"false","custRatings":"4.9","ratingPercent":"98","isChanel":"false","regularPrice":"26.0","title":"David & Young Headwraps","categoryName":"Handbags &amp; Accessories","suppressReviews":"false","pageType":"MASTER","isMaster":"true","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/9/optimized/2952439_fpx.tif","inStock":"true","id":"2410215","showQuestionAnswers":"true","salePrice":"9.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Extra 20% off sale &amp; clearance-priced clothing &amp; handbags, including select womenÂ’s Impulse clothing during Super Saturday!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF ENDS TODAY!","promoCode":"SUPER","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"2410215","giftCard":"false","name":"David &amp; Young Headwraps","showOffers":"true","coach":"false","categoryId":"26846"}},{"productThumbnail":{"longDescription":"Embrace your inner Texan with all the Southern charm of this cowboy hat. Crafted in 14k gold and sterling silver. Chain not included. Approximate length: 6/10 inch. Approximate width: 6/10 inch.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm"},"id":"674533","title":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"80.0","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"},{"walletEligible":"false","checkoutDescription":"Bonus Buy $59 Blue Diamond Stud Earrings with qualifying Fine Jewelry or Sterling Silver purchase.","promoCodeMessage":"Only one promo code may be used per Order.","offerImage":"2/optimized/1538582_fpx","header":"BONUS VALUE $250","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"160.0","title":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm","showReviews":"true","categoryName":"Jewelry &amp; Watches","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"674533","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/1162902_fpx.tif","giftCard":"false","name":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm","inStock":"true","id":"674533","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"544"}},{"productThumbnail":{"longDescription":"Hats on. This everyday go-to from Isotoner is the perfect accessory for capping off all your favorite cold-weather ensembles.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Isotoner Signature Sport Fleece Hat"},"id":"2357984","title":"Isotoner Signature Sport Fleece Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"8.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"24.0","title":"Isotoner Signature Sport Fleece Hat","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2357984","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/5/optimized/3143675_fpx.tif","giftCard":"false","name":"Isotoner Signature Sport Fleece Hat","inStock":"true","id":"2357984","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"Add a dose of fun color to your cool-weather look with this striped beanie with a ribbed finish. By Neff.","shortDescription":"Neff Daily Striped Beanie"},"id":"2402432","title":"Neff Daily Striped Beanie","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"8.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Extra 20% off sale &amp; clearance-priced clothing &amp; handbags, including select womenÂ’s Impulse clothing during Super Saturday!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF ENDS TODAY!","promoCode":"SUPER","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"18.0","title":"Neff Daily Striped Beanie","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2402432","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/2993342_fpx.tif","giftCard":"false","name":"Neff Daily Striped Beanie","inStock":"true","id":"2402432","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"This cable-knit hat and coordinating glove set by Berkshire keeps him looking cool and feeling warm when a chill hits the air. ","shortDescription":"Berkshire Boys' Heidi Cable & Gloves Set"},"id":"2466185","title":"Berkshire Boys' Heidi Cable & Gloves Set","pdpData":{"onlineExclusive":"false","custRatings":"5.0","ratingPercent":"100","isChanel":"false","regularPrice":"28.0","title":"Berkshire Boys' Heidi Cable & Gloves Set","categoryName":"Kids &amp; Baby","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/4/optimized/3152434_fpx.tif","inStock":"true","id":"2466185","showQuestionAnswers":"true","salePrice":"8.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Enjoy 20% off your purchase of select Kids&#039; and Baby styles! Offer ends Sunday, March 6th. ","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF","promoCode":"CUTE","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"2466185","giftCard":"false","name":"Berkshire Boys&#039; Heidi Cable &amp; Gloves Set","showOffers":"true","coach":"false","categoryId":"5991"}},{"productThumbnail":{"longDescription":"Experience the chic side of cold-weather accessorizing with Surell's premium fox fur earmuffs with velvet band.","shortDescription":"Surell Velvet Band Fox Fur Earmuffs"},"id":"2476460","title":"Surell Velvet Band Fox Fur Earmuffs","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"79.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Extra 20% off sale &amp; clearance-priced clothing &amp; handbags, including select womenÂ’s Impulse clothing during Super Saturday!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF ENDS TODAY!","promoCode":"SUPER","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"115.0","title":"Surell Velvet Band Fox Fur Earmuffs","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2476460","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/7/optimized/3094687_fpx.tif","giftCard":"false","name":"Surell Velvet Band Fox Fur Earmuffs","inStock":"true","id":"2476460","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"A stretchy fit lets you wear this luxe rabbit fur piece as a headband or a neckwarmer, depending on your outfit. From Surell.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer"},"id":"2476464","title":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"79.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"115.0","title":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2476464","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/4/optimized/3094704_fpx.tif","giftCard":"false","name":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer","inStock":"true","id":"2476464","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"Serve it up cowboy style. This ready-for-the-rodeo chip and dip is Texan through and through with a wide brim and buckle detail in ultra-durable Wilton Armetale metal. Toss it on the grill or stove to get dips piping hot.","offerDescription":"Extra 20% off select merchandise! CODE: VIP","shortDescription":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip"},"id":"638321","title":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip","pdpData":{"onlineExclusive":"false","custRatings":"4.5","ratingPercent":"90","isChanel":"false","regularPrice":"143.0","title":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip","categoryName":"Dining &amp; Entertaining - Serveware","suppressReviews":"false","pageType":"MEMBER","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/7/optimized/1083677_fpx.tif","inStock":"true","id":"638321","showQuestionAnswers":"true","salePrice":"71.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"Extra 20% off select regular, sale &amp; clearance-priced home items &amp; watches during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"638321","giftCard":"false","name":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip","showOffers":"true","coach":"false","categoryId":"7923"}},{"productThumbnail":{"longDescription":"This star-stitched hat with rabbit fur pom adds a playful touch to your cold-weather wardrobe. From Surell.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat"},"id":"2476465","title":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"69.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"100.0","title":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2476465","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/1/optimized/3094711_fpx.tif","giftCard":"false","name":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat","inStock":"true","id":"2476465","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"A trio of Princesses�Snow White, Cinderella and Tiana�add charm to this cozy tassel-tie hat and matching gloves set by Berkshire.","shortDescription":"Berkshire Girls' or Little Girls' Princesses Hat & Gloves Set"},"id":"2333951","title":"Berkshire Girls' or Little Girls' Princesses Hat & Gloves Set","pdpData":{"onlineExclusive":"false","custRatings":"4.0","ratingPercent":"80","isChanel":"false","regularPrice":"28.0","title":"Berkshire Girls' or Little Girls' Princesses Hat & Gloves Set","categoryName":"Kids &amp; Baby","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/9/optimized/3231869_fpx.tif","inStock":"true","id":"2333951","showQuestionAnswers":"true","salePrice":"6.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Enjoy 20% off your purchase of select Kids&#039; and Baby styles! Offer ends Sunday, March 6th. ","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF","promoCode":"CUTE","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"2333951","giftCard":"false","name":"Berkshire Girls&#039; or Little Girls&#039; Princesses Hat &amp; Gloves Set","showOffers":"true","coach":"false","categoryId":"5991"}}] },
            queryPastPurchases: [{"productThumbnail":{"longDescription":"This logo hat from Element is the top of the style food chain when it comes to your casual look. ","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Element Hat, Knutsen Hat"},"id":"943459","title":"Element Hat, Knutsen Hat","pdpData":{"onlineExclusive":"false","custRatings":"5.0","ratingPercent":"100","isChanel":"false","regularPrice":"22.0","title":"Element Hat, Knutsen Hat","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"https://i.imgur.com/8UZzGZZ.jpg","inStock":"true","id":"943459","showQuestionAnswers":"true","salePrice":"16.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"943459","giftCard":"false","name":"Element Hat, Knutsen Hat","showOffers":"true","coach":"false","categoryId":"47657"}},{"productThumbnail":{"longDescription":"For solid style, this flexfit hat by Hurley is top of the line and made out of 100% cotton offers comfort and breathability.","shortDescription":"Hurley Hat, One & Only Texture Flexfit Hat"},"id":"835915","title":"Hurley Hat, One & Only Texture Flexfit Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"30.0","title":"Hurley Hat, One & Only Texture Flexfit Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"835915","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/3/optimized/1565573_fpx.tif","giftCard":"false","name":"Hurley Hat, One &amp; Only Texture Flexfit Hat","inStock":"true","id":"835915","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"FlexFit comfort and understated style will quickly make this Hurley Bump hat your go-to.","shortDescription":"Hurley Bump 3.0 Hat"},"id":"1113948","title":"Hurley Bump 3.0 Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"29.5","title":"Hurley Bump 3.0 Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"1113948","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/8/optimized/3282368_fpx.tif","giftCard":"false","name":"Hurley Bump 3.0 Hat","inStock":"true","id":"1113948","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"Subtle, goes-with-anything style makes this Hurley Black Suits hat a must-have.","shortDescription":"Hurley Black Suits Hat"},"id":"1216772","title":"Hurley Black Suits Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"30.0","title":"Hurley Black Suits Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"1216772","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/3118482_fpx.tif","giftCard":"false","name":"Hurley Black Suits Hat","inStock":"true","id":"1216772","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}}],
          },
          fields: Adapter.extractFields(config),
          collections: Adapter.extractCollections(config, CollectionsReducer.DEFAULT_COLLECTION),
          sorts: Adapter.extractSorts(config),
          page: {
            ...PageReducer.DEFAULTS,
            sizes: Adapter.extractPageSizes(config, PageReducer.DEFAULT_PAGE_SIZE)
          }
        }
      },
      session: { config }
    });

  export const extractArea = (config: Configuration, defaultValue?: string) =>
    config.area || defaultValue;

  export const extractAutocompleteArea = (config: Configuration) =>
    config.autocomplete.area;

  export const extractAutocompleteProductArea = (config: Configuration) =>
    config.autocomplete.products.area;

  export const extractFields = (config: Configuration) =>
    config.search.fields || [];

  export const extractLanguage = (config: Configuration) =>
    config.language;

  export const extractAutocompleteLanguage = (config: Configuration) =>
    config.autocomplete.language;

  export const extractAutocompleteProductLanguage = (config: Configuration) =>
    config.autocomplete.products.language;

  /**
   * extract current collection from config
   */
  export const extractCollection = (config: Configuration) =>
    typeof config.collection === 'object' ? config.collection.default : config.collection;

  export const extractAutocompleteCollection = (config: Configuration) =>
    config.autocomplete.collection;

  export const extractAutocompleteSuggestionCount = (config: Configuration) =>
    config.autocomplete.suggestionCount;

  export const extractAutocompleteProductCount = (config: Configuration) =>
    config.autocomplete.products.count;

  export const extractAutocompleteNavigationCount = (config: Configuration) =>
    config.autocomplete.navigationCount;

  export const isAutocompleteAlphabeticallySorted = (config: Configuration) =>
    config.autocomplete.alphabetical;

  export const isAutocompleteMatchingFuzzily = (config: Configuration) =>
    config.autocomplete.fuzzy;

  export const extractIndexedState = (state: string | { options: string[], default: string }) => {
    if (typeof state === 'object') {
      return { selected: state.default, allIds: state.options || [state.default] };
    } else {
      return { selected: state, allIds: [state] };
    }
  };

  // tslint:disable-next-line max-line-length
  export const extractCollections = (config: Configuration, defaultValue: string): Store.Indexed.Selectable<Store.Collection> => {
    const { selected, allIds } = Adapter.extractIndexedState(config.collection || defaultValue);

    return {
      selected,
      allIds,
      byId: allIds.reduce((map, name) => Object.assign(map, { [name]: { name } }), {})
    };
  };

  // tslint:disable-next-line max-line-length
  export const extractPageSizes = (config: Configuration, defaultValue: number): Store.SelectableList<number> => {
    const state = config.search.pageSize || defaultValue;
    if (typeof state === 'object') {
      const selected = state.default;
      const items = state.options || [defaultValue];
      const selectedIndex = items.findIndex((pageSize) => pageSize === selected);

      return { items, selected: (selectedIndex === -1 ? 0 : selectedIndex) };
    } else {
      return { selected: 0, items: [state] };
    }
  };

  export const extractSorts = (config: Configuration): Store.SelectableList<Store.Sort> => {
    const state = config.search.sort;
    if (typeof state === 'object' && ('options' in state || 'default' in state)) {
      const selected: Store.Sort = (<{ default: Store.Sort }>state).default || <any>{};
      const items = (<{ options: Store.Sort[] }>state).options || [];
      const selectedIndex = items
        .findIndex((sort) => sort.field === selected.field && !sort.descending === !selected.descending);

      return { items, selected: (selectedIndex === -1 ? 0 : selectedIndex) };
    } else {
      return { selected: 0, items: [<Store.Sort>state] };
    }
  };

  export const extractSaytCategoryField = (config: Configuration) =>
    config.autocomplete.category;

  export const extractAutocompleteNavigationLabels = (config: Configuration) => {
    return config.autocomplete.navigations;
  };

  export const extractINav = (config: Configuration) =>
    config.recommendations.iNav;

  export const extractNavigationsPinned = (config: Configuration) =>
    extractINav(config).navigations.pinned;

  export const extractRefinementsPinned = (config: Configuration) =>
    extractINav(config).refinements.pinned;

  export const extractRefinementsSort = (config: Configuration) =>
    extractINav(config).refinements.sort;

  export const extractLocation = (config: Configuration) =>
    config.recommendations.location;

  export const shouldAddPastPurchaseBias = (config: Configuration) =>
    config.recommendations.pastPurchases.biasCount > 0;
}

export default Adapter;
