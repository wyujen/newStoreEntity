import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, TargetState } from './target.reducer';

export const selectTargetState = Cqrs.createFeatureSelector<TargetState>(FeatureKey);
export const selectTargetEntities = createSelector([selectTargetState], (state: TargetState) => Object.values(state.entities));
