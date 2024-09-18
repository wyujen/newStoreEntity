import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, InventoryReciptState } from './inventoryRecipt.reducer';

export const selectInventoryReciptState = Cqrs.createFeatureSelector<InventoryReciptState>(FeatureKey);
export const selectInventoryReciptEntities = createSelector([selectInventoryReciptState], (state: InventoryReciptState) => Object.values(state.entities));
