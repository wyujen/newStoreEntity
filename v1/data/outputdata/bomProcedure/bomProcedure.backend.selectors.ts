import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, BomProcedureState } from './bomProcedure.reducer';

export const selectBomProcedureState = Cqrs.createFeatureSelector<BomProcedureState>(FeatureKey);
export const selectBomProcedureEntities = createSelector([selectBomProcedureState], (state: BomProcedureState) => Object.values(state.entities));
