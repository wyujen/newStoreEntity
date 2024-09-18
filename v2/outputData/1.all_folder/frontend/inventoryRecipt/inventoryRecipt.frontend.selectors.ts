
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, InventoryReciptState } from './inventoryRecipt.reducer';
import { Entities } from '@yaotai/interface';
import { InventoryReciptRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectInventoryReciptState = Cqrs.createFeatureSelector<InventoryReciptState>(FeatureKey);
export const selectInventoryReciptEntities = createSelector([selectInventoryReciptState], (state: InventoryReciptState) => Object.values(state.entities));

export const selectInventoryReciptMapList = Cqrs.createRelationSelector<InventoryReciptState>('inventoryRecipt').pipe(map((state: InventoryReciptState) => state.entities));

export const selectInventoryRecipts = createSelector(
  [selectInventoryReciptMapList],
  (inventoryReciptEntities: Entities<InventoryReciptRelation>) => Object.values(inventoryReciptEntities)
);
