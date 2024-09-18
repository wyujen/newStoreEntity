import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, ProductState } from './product.reducer';

export const selectProductState = Cqrs.createFeatureSelector<ProductState>(FeatureKey);
export const selectProductEntities = createSelector([selectProductState], (state: ProductState) => Object.values(state.entities));
