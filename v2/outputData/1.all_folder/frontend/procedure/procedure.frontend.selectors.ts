
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, ProcedureState } from './procedure.reducer';
import { Entities } from '@yaotai/interface';
import { ProcedureRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectProcedureState = Cqrs.createFeatureSelector<ProcedureState>(FeatureKey);
export const selectProcedureEntities = createSelector([selectProcedureState], (state: ProcedureState) => Object.values(state.entities));

export const selectProcedureMapList = Cqrs.createRelationSelector<ProcedureState>('procedure').pipe(map((state: ProcedureState) => state.entities));

export const selectProcedures = createSelector(
  [selectProcedureMapList],
  (procedureEntities: Entities<ProcedureRelation>) => Object.values(procedureEntities)
);
