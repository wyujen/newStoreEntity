import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, BillOfMaterialsState } from './billOfMaterials.reducer';

export const selectBillOfMaterialsState = Cqrs.createFeatureSelector<BillOfMaterialsState>(FeatureKey);
export const selectBillOfMaterialsEntities = createSelector([selectBillOfMaterialsState], (state: BillOfMaterialsState) => Object.values(state.entities));
