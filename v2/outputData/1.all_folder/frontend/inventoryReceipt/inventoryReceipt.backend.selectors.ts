import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, InventoryReceiptState } from './inventoryReceipt.reducer';

export const selectInventoryReceiptState = Cqrs.createFeatureSelector<InventoryReceiptState>(FeatureKey);
export const selectInventoryReceiptEntities = createSelector([selectInventoryReceiptState], (state: InventoryReceiptState) => Object.values(state.entities));
