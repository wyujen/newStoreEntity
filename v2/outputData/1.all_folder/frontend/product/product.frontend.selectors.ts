
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, ProductState } from './product.reducer';
import { Entities } from '@yaotai/interface';
import { ProductRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectProductState = Cqrs.createFeatureSelector<ProductState>(FeatureKey);
export const selectProductEntities = createSelector([selectProductState], (state: ProductState) => Object.values(state.entities));

export const selectProductMapList = Cqrs.createRelationSelector<ProductState>('product').pipe(map((state: ProductState) => state.entities));

export const selectProducts = createSelector(
  [selectProductMapList],
  (productEntities: Entities<ProductRelation>) => Object.values(productEntities)
);
