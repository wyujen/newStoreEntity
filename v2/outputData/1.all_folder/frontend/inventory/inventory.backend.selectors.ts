import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, InventoryState } from './inventory.reducer';

export const selectInventoryState = Cqrs.createFeatureSelector<InventoryState>(FeatureKey);
export const selectInventoryEntities = createSelector([selectInventoryState], (state: InventoryState) => Object.values(state.entities));
