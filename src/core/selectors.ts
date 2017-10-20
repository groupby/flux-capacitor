import { Request } from 'groupby-api';
import { QueryTimeAutocompleteConfig, QueryTimeProductSearchConfig } from 'sayt';
import Autocomplete from './adapters/autocomplete';
import Configuration from './adapters/configuration';
import Search, { MAX_RECORDS } from './adapters/search';
import AppConfig from './configuration';
import Store from './store';

namespace Selectors {

  /**
   * Returns the applied area.
   */
  export const area = (state: Store.State) =>
    state.data.present.area;

  /**
   * Returns the requested fields.
   */
  export const fields = (state: Store.State) =>
    state.data.present.fields;

  /**
   * Returns the current original query.
   */
  export const query = (state: Store.State) =>
    state.data.present.query.original;

  /**
   * Returns the corrected query if it exists, otherwise returns the original query.
   */
  export const currentQuery = (state: Store.State) => {
    const query = state.data.present.query;
    return query.corrected || query.original;
  };

  /**
   * Returns the collections object.
   */
  export const collections = (state: Store.State) =>
    state.data.present.collections;

  /**
   * Returns the current selected collection.
   */
  export const collection = (state: Store.State) =>
    Selectors.collections(state).selected;

  /**
   * Returns the index of the given collection.
   */
  export const collectionIndex = (state: Store.State, name: string) =>
    Selectors.collections(state).allIds.indexOf(name);

  /**
   * Returns the page sizes object.
   */
  export const pageSizes = (state: Store.State) =>
    state.data.present.page.sizes;

  /**
   * Returns the current selected page size.
   */
  export const pageSize = (state: Store.State) => {
    const selectedPageSizes = Selectors.pageSizes(state);
    return selectedPageSizes.items[selectedPageSizes.selected];
  };

  /**
   * Returns the index of the selected page size.
   */
  export const pageSizeIndex = (state: Store.State) =>
    Selectors.pageSizes(state).selected;

  /**
   * Returns the current page.
   */
  export const page = (state: Store.State) =>
    state.data.present.page.current;

  /**
   * Returns the last page index, ie number of pages
   */
  export const totalPages = (state: Store.State) =>
    state.data.present.page.last;
  /**
   * Returns the sorts object.
   */
  export const sorts = (state: Store.State) =>
    state.data.present.sorts;

  /**
   * Returns the current selected sort.
   */
  export const sort = (state: Store.State) => {
    const selectedSorts = Selectors.sorts(state);
    return selectedSorts.items[selectedSorts.selected];
  };

  /**
   * Returns the index of the current selected sort.
   */
  export const sortIndex = (state: Store.State) =>
    Selectors.sorts(state).selected;

  /**
   * Returns the request skip needed for the current page and given page size.
   */
  export const skip = (state: Store.State, pagesize: number) =>
    (Selectors.page(state) - 1) * pagesize;

  /**
   * Returns the current products
   */
  export const products = (state: Store.State) =>
    state.data.present.products;

  /**
   * Returns the current products extended with metadata
   */
  export const productsWithMetadata = (state: Store.State, idField: string) => {
    const pastPurchases = Selectors.pastPurchaseProductsBySku(state);
    return Selectors.products(state).map((data) => {
      const meta: any = {};

      if (data[idField] in pastPurchases) {
        meta.pastPurchase = true;
      }

      return { data, meta };
    });
  };

  /**
   * Returns the current details object.
   */
  export const details = (state: Store.State) =>
    state.data.present.details;

  /**
   * Returns the current selected refinements.
   */
  export const selectedRefinements = (state: Store.State) =>
    Selectors.navigations(state)
      .reduce((allRefinements, nav) =>
        allRefinements.concat(nav.selected
          .map<any>((refinementIndex) => nav.refinements[refinementIndex])
          .reduce((refs, { low, high, value }) =>
            refs.concat(nav.range
              ? { navigationName: nav.field, type: 'Range', high, low }
              : { navigationName: nav.field, type: 'Value', value }), [])), []);

  /**
   * Returns the maximum value for the given range navigation.
   */
  export const rangeNavigationMax = (state: Store.State, navigationId) =>
    Selectors.navigation(state, navigationId).max;

  /**
   * Returns the minimum value for the given range navigation.
   */
  export const rangeNavigationMin = (state: Store.State, navigationId) =>
    Selectors.navigation(state, navigationId).min;

  /**
   * Returns the navigation object for the given navigationId.
   */
  export const navigation = (state: Store.State, navigationId: string) =>
    state.data.present.navigations.byId[navigationId];

  /**
   * Returns the navigations.
   */
  export const navigations = (state: Store.State) =>
    state.data.present.navigations.allIds.map<Store.Navigation>(Selectors.navigation.bind(null, state));

  /**
   * Returns the navigation sort.
   */
  export const navigationSort = (state: Store.State) =>
    state.data.present.navigations.sort;

  /**
   * Finds the refinement based on the given navigationId and index and returns
   * true if it is not selected, false otherwise.
   */
  export const isRefinementDeselected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && !nav.selected.includes(index);
  };

  /**
   * Finds the refinement based on the given navigationId and index and returns
   * true if it is selected, false otherwise.
   */
  export const isRefinementSelected = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.selected.includes(index);
  };

  /**
   * Returns true if the navigation based on the given navigationId has more refinements.
   */
  export const hasMoreRefinements = (state: Store.State, navigationId: string) => {
    const nav = Selectors.navigation(state, navigationId);
    return nav && nav.more;
  };

  /**
   * Returns the refinement object for the given navigationId and index.
   */
  export const refinementCrumb = (state: Store.State, navigationId: string, index: number) => {
    const nav = Selectors.navigation(state, navigationId);
    const { value, low, high } = <any>nav.refinements[index];

    return {
      value,
      low,
      high,
      field: navigationId,
      range: nav.range,
    };
  };

  /**
   * Returns the current record count.
   */
  export const recordCount = (state: Store.State) =>
    state.data.present.recordCount;

  /**
   * Returns the current autocomplete object.
   */
  export const autocomplete = (state: Store.State) =>
    state.data.present.autocomplete;

  /**
   * Returns the currently typed in autocomplete query.
   */
  export const autocompleteQuery = (state: Store.State) =>
    Selectors.autocomplete(state).query;

  /**
   * Returns the set autocomplete category field navigationId.
   */
  export const autocompleteCategoryField = (state: Store.State) =>
    Selectors.autocomplete(state).category.field;

  /**
   * Returns the current values for the autocomplete category field.
   */
  export const autocompleteCategoryValues = (state: Store.State) =>
    Selectors.autocomplete(state).category.values;

  /**
   * Returns the current autocomplete suggestions.
   */
  export const autocompleteSuggestions = (state: Store.State) =>
    Selectors.autocomplete(state).suggestions;

  /**
   * Returns the current autocomplete navigations.
   */
  export const autocompleteNavigations = (state: Store.State) =>
    Selectors.autocomplete(state).navigations;

  /**
   * Returns the current session location.
   */
  export const location = (state: Store.State) =>
    state.session.location;

  /**
   * Returns the current session config
   */
  export const config = (state: Store.State) =>
    state.session.config;

  /**
   * Returns the current recommendations product suggestions.
   */
  export const recommendationsProducts = (state: Store.State) =>
    state.data.present.recommendations.suggested.products;

  /**
   * Returns the SKUs of previously purchased products.
   */
  export const pastPurchaseProductsBySku = (state: Store.State) =>
    state.data.present.recommendations.pastPurchases.products
    .reduce((products, product) => Object.assign(products, { [product.sku]: product.quantity }), {});

  // tslint:disable-next-line
  const fakePastPurchases = [{"productThumbnail":{"longDescription":"From boho feathers to beaded embellishments, David & Young has the headwrap that suits your style best.","shortDescription":"David & Young Headwraps"},"id":"2410215","title":"David & Young Headwraps","pdpData":{"onlineExclusive":"false","custRatings":"4.9","ratingPercent":"98","isChanel":"false","regularPrice":"26.0","title":"David & Young Headwraps","categoryName":"Handbags &amp; Accessories","suppressReviews":"false","pageType":"MASTER","isMaster":"true","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/9/optimized/2952439_fpx.tif","inStock":"true","id":"2410215","showQuestionAnswers":"true","salePrice":"9.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Extra 20% off sale &amp; clearance-priced clothing &amp; handbags, including select womenÂ’s Impulse clothing during Super Saturday!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF ENDS TODAY!","promoCode":"SUPER","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"2410215","giftCard":"false","name":"David &amp; Young Headwraps","showOffers":"true","coach":"false","categoryId":"26846"}},{"productThumbnail":{"longDescription":"Embrace your inner Texan with all the Southern charm of this cowboy hat. Crafted in 14k gold and sterling silver. Chain not included. Approximate length: 6/10 inch. Approximate width: 6/10 inch.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm"},"id":"674533","title":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"80.0","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"},{"walletEligible":"false","checkoutDescription":"Bonus Buy $59 Blue Diamond Stud Earrings with qualifying Fine Jewelry or Sterling Silver purchase.","promoCodeMessage":"Only one promo code may be used per Order.","offerImage":"2/optimized/1538582_fpx","header":"BONUS VALUE $250","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"160.0","title":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm","showReviews":"true","categoryName":"Jewelry &amp; Watches","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"674533","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/1162902_fpx.tif","giftCard":"false","name":"14k Gold and Sterling Silver Charm, Cowboy Hat Charm","inStock":"true","id":"674533","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"544"}},{"productThumbnail":{"longDescription":"Hats on. This everyday go-to from Isotoner is the perfect accessory for capping off all your favorite cold-weather ensembles.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Isotoner Signature Sport Fleece Hat"},"id":"2357984","title":"Isotoner Signature Sport Fleece Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"8.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"24.0","title":"Isotoner Signature Sport Fleece Hat","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2357984","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/5/optimized/3143675_fpx.tif","giftCard":"false","name":"Isotoner Signature Sport Fleece Hat","inStock":"true","id":"2357984","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"Add a dose of fun color to your cool-weather look with this striped beanie with a ribbed finish. By Neff.","shortDescription":"Neff Daily Striped Beanie"},"id":"2402432","title":"Neff Daily Striped Beanie","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"8.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Extra 20% off sale &amp; clearance-priced clothing &amp; handbags, including select womenÂ’s Impulse clothing during Super Saturday!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF ENDS TODAY!","promoCode":"SUPER","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"18.0","title":"Neff Daily Striped Beanie","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2402432","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/2993342_fpx.tif","giftCard":"false","name":"Neff Daily Striped Beanie","inStock":"true","id":"2402432","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"This cable-knit hat and coordinating glove set by Berkshire keeps him looking cool and feeling warm when a chill hits the air. ","shortDescription":"Berkshire Boys' Heidi Cable & Gloves Set"},"id":"2466185","title":"Berkshire Boys' Heidi Cable & Gloves Set","pdpData":{"onlineExclusive":"false","custRatings":"5.0","ratingPercent":"100","isChanel":"false","regularPrice":"28.0","title":"Berkshire Boys' Heidi Cable & Gloves Set","categoryName":"Kids &amp; Baby","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/4/optimized/3152434_fpx.tif","inStock":"true","id":"2466185","showQuestionAnswers":"true","salePrice":"8.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Enjoy 20% off your purchase of select Kids&#039; and Baby styles! Offer ends Sunday, March 6th. ","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF","promoCode":"CUTE","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"2466185","giftCard":"false","name":"Berkshire Boys&#039; Heidi Cable &amp; Gloves Set","showOffers":"true","coach":"false","categoryId":"5991"}},{"productThumbnail":{"longDescription":"Experience the chic side of cold-weather accessorizing with Surell's premium fox fur earmuffs with velvet band.","shortDescription":"Surell Velvet Band Fox Fur Earmuffs"},"id":"2476460","title":"Surell Velvet Band Fox Fur Earmuffs","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"79.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Extra 20% off sale &amp; clearance-priced clothing &amp; handbags, including select womenÂ’s Impulse clothing during Super Saturday!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF ENDS TODAY!","promoCode":"SUPER","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"115.0","title":"Surell Velvet Band Fox Fur Earmuffs","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2476460","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/7/optimized/3094687_fpx.tif","giftCard":"false","name":"Surell Velvet Band Fox Fur Earmuffs","inStock":"true","id":"2476460","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"A stretchy fit lets you wear this luxe rabbit fur piece as a headband or a neckwarmer, depending on your outfit. From Surell.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer"},"id":"2476464","title":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"79.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"115.0","title":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2476464","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/4/optimized/3094704_fpx.tif","giftCard":"false","name":"Surell Stretchy Sheared Rabbit Fur Headband Neckwarmer","inStock":"true","id":"2476464","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"Serve it up cowboy style. This ready-for-the-rodeo chip and dip is Texan through and through with a wide brim and buckle detail in ultra-durable Wilton Armetale metal. Toss it on the grill or stove to get dips piping hot.","offerDescription":"Extra 20% off select merchandise! CODE: VIP","shortDescription":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip"},"id":"638321","title":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip","pdpData":{"onlineExclusive":"false","custRatings":"4.5","ratingPercent":"90","isChanel":"false","regularPrice":"143.0","title":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip","categoryName":"Dining &amp; Entertaining - Serveware","suppressReviews":"false","pageType":"MEMBER","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/7/optimized/1083677_fpx.tif","inStock":"true","id":"638321","showQuestionAnswers":"true","salePrice":"71.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"Extra 20% off select regular, sale &amp; clearance-priced home items &amp; watches during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"638321","giftCard":"false","name":"Wilton Armetale Serveware, Cowboy Hat Chip and Dip","showOffers":"true","coach":"false","categoryId":"7923"}},{"productThumbnail":{"longDescription":"This star-stitched hat with rabbit fur pom adds a playful touch to your cold-weather wardrobe. From Surell.","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat"},"id":"2476465","title":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","salePrice":"69.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"isChanel":"false","regularPrice":"100.0","title":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat","showReviews":"true","categoryName":"Handbags &amp; Accessories","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"2476465","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/1/optimized/3094711_fpx.tif","giftCard":"false","name":"Surell Acrylic Star Stitched Knit Rabbit Fur Pom Hat","inStock":"true","id":"2476465","showOffers":"true","coach":"false","showQuestionAnswers":"true","categoryId":"26846"}},{"productThumbnail":{"longDescription":"A trio of Princesses�Snow White, Cinderella and Tiana�add charm to this cozy tassel-tie hat and matching gloves set by Berkshire.","shortDescription":"Berkshire Girls' or Little Girls' Princesses Hat & Gloves Set"},"id":"2333951","title":"Berkshire Girls' or Little Girls' Princesses Hat & Gloves Set","pdpData":{"onlineExclusive":"false","custRatings":"4.0","ratingPercent":"80","isChanel":"false","regularPrice":"28.0","title":"Berkshire Girls' or Little Girls' Princesses Hat & Gloves Set","categoryName":"Kids &amp; Baby","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/9/optimized/3231869_fpx.tif","inStock":"true","id":"2333951","showQuestionAnswers":"true","salePrice":"6.99","specialOffers":[[{"walletEligible":"true","checkoutDescription":"Enjoy 20% off your purchase of select Kids&#039; and Baby styles! Offer ends Sunday, March 6th. ","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 20% OFF","promoCode":"CUTE","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"2333951","giftCard":"false","name":"Berkshire Girls&#039; or Little Girls&#039; Princesses Hat &amp; Gloves Set","showOffers":"true","coach":"false","categoryId":"5991"}}];
  export const pastPurchases = (state: Store.State): any[] =>
  fakePastPurchases;
    // state.data.present.recommendations.pastPurchases.products;

  // tslint:disable-next-line
  const fakeQueryPastPurchase = [{"productThumbnail":{"longDescription":"This logo hat from Element is the top of the style food chain when it comes to your casual look. ","offerDescription":"Extra 25% off select merchandise! CODE: VIP","shortDescription":"Element Hat, Knutsen Hat"},"id":"943459","title":"Element Hat, Knutsen Hat","pdpData":{"onlineExclusive":"false","custRatings":"5.0","ratingPercent":"100","isChanel":"false","regularPrice":"22.0","title":"Element Hat, Knutsen Hat","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressReviews":"false","pageType":"SINGLE ITEM","isMaster":"false","imageUrl":"https://i.imgur.com/8UZzGZZ.jpg","inStock":"true","id":"943459","showQuestionAnswers":"true","salePrice":"16.99","specialOffers":[[{"walletEligible":"false","checkoutDescription":"EXTRA 25% OFF regular, sale &amp; clearance prices, including select fine &amp; fashion jewelry during the VIP Sale!","promoCodeMessage":"Only one promo code may be used per Order.","header":"EXTRA 25% OFF: USE VIP","promoCode":"VIP","badgeText":"BADGE_TEXT"}]],"showReviews":"true","suppressedForIntlShipping":"false","internationalMode":"true","parentSku":"943459","giftCard":"false","name":"Element Hat, Knutsen Hat","showOffers":"true","coach":"false","categoryId":"47657"}},{"productThumbnail":{"longDescription":"For solid style, this flexfit hat by Hurley is top of the line and made out of 100% cotton offers comfort and breathability.","shortDescription":"Hurley Hat, One & Only Texture Flexfit Hat"},"id":"835915","title":"Hurley Hat, One & Only Texture Flexfit Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"30.0","title":"Hurley Hat, One & Only Texture Flexfit Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"835915","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/3/optimized/1565573_fpx.tif","giftCard":"false","name":"Hurley Hat, One &amp; Only Texture Flexfit Hat","inStock":"true","id":"835915","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"FlexFit comfort and understated style will quickly make this Hurley Bump hat your go-to.","shortDescription":"Hurley Bump 3.0 Hat"},"id":"1113948","title":"Hurley Bump 3.0 Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"29.5","title":"Hurley Bump 3.0 Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"1113948","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/8/optimized/3282368_fpx.tif","giftCard":"false","name":"Hurley Bump 3.0 Hat","inStock":"true","id":"1113948","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}},{"productThumbnail":{"longDescription":"Subtle, goes-with-anything style makes this Hurley Black Suits hat a must-have.","shortDescription":"Hurley Black Suits Hat"},"id":"1216772","title":"Hurley Black Suits Hat","pdpData":{"onlineExclusive":"false","ratingPercent":"0","isChanel":"false","regularPrice":"30.0","title":"Hurley Black Suits Hat","showReviews":"true","categoryName":"Men - Hats, Gloves &amp; Scarves","suppressedForIntlShipping":"false","internationalMode":"true","suppressReviews":"false","pageType":"SINGLE ITEM","parentSku":"1216772","isMaster":"false","imageUrl":"http://slimages.macysassets.com/is/image/MCY/products/2/optimized/3118482_fpx.tif","giftCard":"false","name":"Hurley Black Suits Hat","inStock":"true","id":"1216772","showOffers":"false","coach":"false","showQuestionAnswers":"true","categoryId":"47657"}}];
  export const queryPastPurchases = (state: Store.State) =>
    // state.data.present.recommendations.queryPastPurchases;
    fakeQueryPastPurchase;

  /**
   * Returns the ui state for the all of the tags with the given tagName.
   */
  export const uiTagStates = (state: Store.State, tagName: string) =>
    state.ui[tagName];

  /**
   * Returns the ui state for the tag with the given tagName and id.
   */
  export const uiTagState = (state: Store.State, tagName: string, id: string) =>
    (Selectors.uiTagStates(state, tagName) || {})[id];
}

export default Selectors;
