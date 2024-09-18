
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, BillOfMaterialsState } from './billOfMaterials.reducer';
import { Entities } from '@yaotai/interface';
import { BillOfMaterialsRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectBillOfMaterialsState = Cqrs.createFeatureSelector<BillOfMaterialsState>(FeatureKey);
export const selectBillOfMaterialsEntities = createSelector([selectBillOfMaterialsState], (state: BillOfMaterialsState) => Object.values(state.entities));

export const selectBillOfMaterialsMapList = Cqrs.createRelationSelector<BillOfMaterialsState>('billOfMaterials').pipe(map((state: BillOfMaterialsState) => state.entities));

export const selectBillOfMaterialss = createSelector(
  [selectBillOfMaterialsMapList],
  (billOfMaterialsEntities: Entities<BillOfMaterialsRelation>) => Object.values(billOfMaterialsEntities)
);
