import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, PurchuserOrderState } from './purchuserOrder.reducer';

export const selectPurchuserOrderState = Cqrs.createFeatureSelector<PurchuserOrderState>(FeatureKey);
export const selectPurchuserOrderEntities = createSelector([selectPurchuserOrderState], (state: PurchuserOrderState) => Object.values(state.entities));
