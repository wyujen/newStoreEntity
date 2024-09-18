
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, MaterialState } from './material.reducer';
import { Entities } from '@yaotai/interface';
import { MaterialRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectMaterialState = Cqrs.createFeatureSelector<MaterialState>(FeatureKey);
export const selectMaterialEntities = createSelector([selectMaterialState], (state: MaterialState) => Object.values(state.entities));

export const selectMaterialMapList = Cqrs.createRelationSelector<MaterialState>('material').pipe(map((state: MaterialState) => state.entities));

export const selectMaterials = createSelector(
  [selectMaterialMapList],
  (materialEntities: Entities<MaterialRelation>) => Object.values(materialEntities)
);
