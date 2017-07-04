import { ForkEffect } from 'redux-saga/effects';
import FluxCapacitor from '../../flux-capacitor';
import autocomplete from './autocomplete';
import collection from './collection';
import productDetails from './product-details';
import products from './products';
import refinements from './refinements';

export const SAGA_CREATORS = [
  autocomplete,
  collection,
  productDetails,
  products,
  refinements
];

export default function createSagas(flux: FluxCapacitor) {
  return SAGA_CREATORS.map((createSaga) => createSaga(flux));
}
