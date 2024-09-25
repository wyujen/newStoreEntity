
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, InventoryReceiptState } from './inventoryReceipt.reducer';
import { Entities } from '@yaotai/interface';
import { InventoryReceiptRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectInventoryReceiptState = Cqrs.createFeatureSelector<InventoryReceiptState>(FeatureKey);
export const selectInventoryReceiptEntities = createSelector([selectInventoryReceiptState], (state: InventoryReceiptState) => Object.values(state.entities));

export const selectInventoryReceiptMapList = Cqrs.createRelationSelector<InventoryReceiptState>('inventoryReceipt').pipe(map((state: InventoryReceiptState) => state.entities));

export const selectInventoryReceipts = createSelector(
  [selectInventoryReceiptMapList],
  (inventoryReceiptEntities: Entities<InventoryReceiptRelation>) => Object.values(inventoryReceiptEntities)
);
