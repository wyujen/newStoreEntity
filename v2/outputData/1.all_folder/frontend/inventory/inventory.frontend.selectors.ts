
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, InventoryState } from './inventory.reducer';
import { Entities } from '@yaotai/interface';
import { InventoryRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectInventoryState = Cqrs.createFeatureSelector<InventoryState>(FeatureKey);
export const selectInventoryEntities = createSelector([selectInventoryState], (state: InventoryState) => Object.values(state.entities));

export const selectInventoryMapList = Cqrs.createRelationSelector<InventoryState>('inventory').pipe(map((state: InventoryState) => state.entities));

export const selectInventorys = createSelector(
  [selectInventoryMapList],
  (inventoryEntities: Entities<InventoryRelation>) => Object.values(inventoryEntities)
);
