
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, BomProcedureState } from './bomProcedure.reducer';
import { Entities } from '@yaotai/interface';
import { BomProcedureRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectBomProcedureState = Cqrs.createFeatureSelector<BomProcedureState>(FeatureKey);
export const selectBomProcedureEntities = createSelector([selectBomProcedureState], (state: BomProcedureState) => Object.values(state.entities));

export const selectBomProcedureMapList = Cqrs.createRelationSelector<BomProcedureState>('bomProcedure').pipe(map((state: BomProcedureState) => state.entities));

export const selectBomProcedures = createSelector(
  [selectBomProcedureMapList],
  (bomProcedureEntities: Entities<BomProcedureRelation>) => Object.values(bomProcedureEntities)
);
