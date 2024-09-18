
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, PurchuserOrderState } from './purchuserOrder.reducer';
import { Entities } from '@yaotai/interface';
import { PurchuserOrderRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectPurchuserOrderState = Cqrs.createFeatureSelector<PurchuserOrderState>(FeatureKey);
export const selectPurchuserOrderEntities = createSelector([selectPurchuserOrderState], (state: PurchuserOrderState) => Object.values(state.entities));

export const selectPurchuserOrderMapList = Cqrs.createRelationSelector<PurchuserOrderState>('purchuserOrder').pipe(map((state: PurchuserOrderState) => state.entities));

export const selectPurchuserOrders = createSelector(
  [selectPurchuserOrderMapList],
  (purchuserOrderEntities: Entities<PurchuserOrderRelation>) => Object.values(purchuserOrderEntities)
);
