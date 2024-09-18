import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, ProcedureState } from './procedure.reducer';

export const selectProcedureState = Cqrs.createFeatureSelector<ProcedureState>(FeatureKey);
export const selectProcedureEntities = createSelector([selectProcedureState], (state: ProcedureState) => Object.values(state.entities));
